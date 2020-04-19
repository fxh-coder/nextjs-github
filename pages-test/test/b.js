import React, { useState, useEffect, useReducer } from 'react'

class MyCount extends React.Component {
    state = {
        count: 0
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({ count: this.state.count + 1 })
        }, 1000)
    }

    componentWillUnmount() {
        if(this.interval) {
            clearInterval(this.interval)
        }
    }

    render() {
        return <span>{this.state.count}</span>
    }
}

function countReducer(state, action) {
    switch(action.type) {
        case 'add':
            return state + 1
        case 'minus':
            return state - 1
        default:
            return state
    }
}

function MyCountFunc() {
    // const [count, setCount] = useState(0)

    const [count, dispatchCount] = useReducer(countReducer, 0)

    useEffect(() => {
        const interval = setInterval(() => {
            // setCount(c => c + 1)
            dispatchCount({ type: 'add' })
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    return <span>{count}</span>
}

export default MyCountFunc