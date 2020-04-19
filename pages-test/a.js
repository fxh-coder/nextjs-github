import Link from 'next/link'
import { withRouter } from 'next/router'
import styled from 'styled-components'


const Title = styled.h1`
    color: yellow;
    font-size: 40px;
`

const A = ({ router, name, time }) => (
    <>
        <Title>this is title {time}</Title>
        <Link href="#aaa">
            <a>
                A {router.query.id}{name}
            </a>
        </Link>
        <style jsx>{`
            a {
                color: blue;
            }
        `}</style>
    </>
)


A.getInitialProps = async (ctx) => {
    const moment = await import('moment')
    const promise = new Promise(resolve => {
        setTimeout(() => {
            resolve({
                name: 'jocky',
                time: moment.default(Date.now() - 60 * 1000).fromNow(),
            })
        }, 1000)
    })
    return await promise
}


export default withRouter(A)