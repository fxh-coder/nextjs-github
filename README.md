## 使用nextjs react koa开发github搜索

## nextjs学习
   1. 页面跳转
      1) 使用Link标签：引入Link标签从next中，然后
        <Link href="/a">
            <Button>Index</Button>
        </Link>
        href中定义的是 pages文件夹下面的，pages文件夹下面的
        文件默认是nextjs中的路由跳转页面
      2) 使用Router模块： 从next中引入Router模块，然后定义一
        个方法，使用Router.push('/test/b')，最后在需要点击跳
        转的按钮或其他元素上绑定这个事件就可以
    
    2. 动态路由
       nextjs动态路由：1) 可以使用href='/a?id=1'
                       2) 可以使用Router的对象方式：
        Router.push({
            pathname: '/test/b',
            query: {
                id: 2
            }
        })
        然后在需要接收参数的页面，比如a.js
        先引入：import { withRouter } from 'next/router'
        然后：const A = ({ router }) => <Button>antd {router.query.id}</Button>
        最后将A：export default withRouter(A)传递一个函数返回一个新函数的
        方式
    3. 路由映射
       点击跳转的路由与现实在浏览器地址栏中的地址不相同，形成一种映射
       1) 使用Link标签的as属性
       2) 使用Router的第二个参数：
        Router.push({
            pathname: '/test/b',
            query: {
                id: 2
            }
        }, '/test/b/2')
        但是这种方式存在一种缺陷，因为nextjs默认的路由是在pages下面的文件
        但是以上的路由方式是没有在pages下面有对应的页面文件的
        主要原因就是在点击按钮或者触发事件都是在浏览器端渲染，跳转的，
        但是刷新页面是从服务器端渲染的，所以以上方法一旦刷新页面就睡出现
        404问题

        解决办法：使用koa-router，在server.js中引入koa-router
        const router = new Router()
        router.get('/a/:id', async (ctx) => {
        const id = ctx.params.id
        await handle(ctx.req, ctx.res, {
            pathname: '/a',
            query: { id }
        })
            ctx.respond = false
        })

        server.use(router.routes())
