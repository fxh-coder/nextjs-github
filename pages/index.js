import { Button, Icon, Tabs } from 'antd'
import getConfig from 'next/config'
import { connect } from 'react-redux'
import Router, { withRouter } from 'next/router'
import { useEffect } from 'react'
import LRU from 'lru-cache'
import { cacheArray } from '../lib/repo-basic-cache'

import Repo from '../components/Repo'

// 这种缓存策略是只要用户点击(也就是用户还在使用，每使用一次)
// 缓存时间就会重新计算，适用于数据变化不大的，或者只有用户
// 自己更新数据
// const cache = new LRU({
//     maxAge: 1000 * 10
// })

const api = require('../lib/api')

const { publicRuntimeConfig } = getConfig()

const isServer = typeof window === 'undefined'

let cachedUserRepos, cachedUserStaredRepos

function Index({ userRepos, userStaredRepos, user, router }) {

    const tabKey = router.query.key || '1'

    const handleTabChange = (activeKey) => {
        Router.push(`/?key=${activeKey}`)
    }

    useEffect(() => {
        // 作为缓存数据使用，并且希望第一次服务端渲染后，我们第一次点击tab
        // 切换栏，也不会在进行请求，所以要放在这里，不应该放在getInitialProps
        // 里面
        if (!isServer) {
            cachedUserRepos = userRepos
            cachedUserStaredRepos = userStaredRepos
            // if (userRepos) {
            //     cache.set('userRepos', userRepos)
            // }
            // if (userStaredRepos) {
            //     cache.set('userStaredRepos', userStaredRepos)
            // }   
            // 这种缓存策略就是无论是否还在使用，只要到时间，就刷新
            const timeout = setTimeout(() => {
                cachedUserRepos = null
                cachedUserStaredRepos = null
            }, 1000 * 60 * 10) 
        }
    }, [userRepos, userStaredRepos])

    useEffect(() => {
        if (!isServer) {
            cacheArray(userRepos)
            cacheArray(userStaredRepos)
        } 
    })

    if (!user || !user.id) {
        return (
            <div className="root">
                <p>亲，您还没有登录哦~</p>
                <Button href={publicRuntimeConfig.OAUTH_URL}>点击登录</Button>
                <style jsx>{`
                    .root {
                        height: 400px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                `}</style>
            </div>
        )
    }
    return (
        <div className="root">
            <div className="user-info">
                <img src={user.avatar_url} alt="user avatar" className="avatar" />
                <span className="login">{user.login}</span>
                <span className="name">{user.name}</span>
                <span className="bio">{user.bio}</span>
                <p className="email">
                    <Icon type="mail" style={{ marginRight: 10 }}></Icon>
                    {
                        user.email ? (
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                        ) : (
                            <a href='mailto:fxh19980816@163.com'>fxh19980816@163.com</a>
                        )
                    }
                </p>
            </div>
            <div className="user-repos">
                <Tabs activeKey={tabKey} onChange={handleTabChange} animated={false}>
                    <Tabs.TabPane tab="你的仓库" key="1">
                        {
                            userRepos.map((repo, index) => (
                                <Repo repo={repo} key={index} />
                            )) 
                        }
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="你关注的仓库" key="2">
                        {
                            userStaredRepos.map((repo, index) => (
                                <Repo repo={repo} key={index} />
                            )) 
                        }
                    </Tabs.TabPane>
                </Tabs>
            </div>
            <style jsx>{`
                .root {
                    display: flex;
                    align-items: flex-start;
                    padding: 20px 0;
                }
                .user-info {
                    width: 200px;
                    margin-right: 40px;
                    /* 禁止被压缩 */
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                }
                .login {
                    font-weight: 800;
                    font-size: 20px;
                    margin-top: 20px;
                }
                .name {
                    font-size: 16px;
                    color: #777;
                }
                .bio {
                    margin-top: 20px;
                    color: #333;
                }
                .avatar {
                    width: 100%;
                    border-radius: 5px;
                }
                .user-repos {
                    flex-grow: 1;
                }
            `}</style>
        </div>
    )
}

Index.getInitialProps = async ({ ctx, reduxStore }) => {

    const user = reduxStore.getState().user
    if (!user || !user.id) {
        return {
            isLogin: false
        }
    }

    // 进行判断，如果请求过一次，再次请求，就是用缓存的，不用重新请求
    // 需要判断是不是服务端渲染，服务端的话，一开启nextjs，index模块
    // 第一次被加载后，变量赋过值就不会再被重新赋值，也就是getInitialProps
    // 只执行一次，所以要判断，防止缓存被共用
    if (!isServer) {
        // if (cache.get('userRepos') && cache.get('userStaredRepos')) {
        //     return {
        //         userRepos: cache.get('userRepos'),
        //         userStaredRepos: cache.get('userStaredRepos')
        //     }
        // }
        if (cachedUserRepos && cachedUserStaredRepos) {
            return {
                userRepos: cachedUserRepos,
                userStaredRepos: cachedUserStaredRepos
            }
        }
    }

    const userRepos = await api.request({
        url: '/user/repos'
    }, ctx.req, ctx.res)

    const userStaredRepos = await api.request({
        url: '/user/starred'
    }, ctx.req, ctx.res)

    

    return {
        isLogin: true,
        userRepos: userRepos.data,
        userStaredRepos: userStaredRepos.data
    }
}

export default withRouter(connect(
    function mapState(state) {
        return {
            user: state.user
        }
    }
)(Index))
