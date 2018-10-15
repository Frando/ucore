import React from 'react'
import shallowEqual from 'shallowequal'

const cleanProps = (props) => {
  let {
    children,
    select,
    store,
    ...rest
  } = props
  return rest
}

export class Subscriber extends React.Component {
  constructor (props) {
    super()
    const sel = props.store.select(props.select)
    this.state = { sel }
    this.onUpdate = this.onUpdate.bind(this)
  }

  componentDidMount () {
    this.props.store.subscribe(this.onUpdate, this.props.select)
    if (this.props.init) {
      this.props.store.actions[this.props.init]
    }
  }

  componentWillUnmount () {
    this.props.store.unsubscribe(this.onUpdate)
  }

  onUpdate (sel) {
    this.setState({ sel })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (shallowEqual(this.state.sel, nextState.sel)) return false
    return true
  }

  render () {
    const { children, store } = this.props
    const { sel } = this.state
    return typeof children === 'function' ? children(sel, store) : children
  }
}

class WaitForStore extends React.Component {
  constructor (props) {
    super()
    this.state = {}
    if (props.core.getStore) this.store = props.core.getStore(props.store)
  }

  componentDidMount () {
    if (!this.store) {
      this.props.core.ready(() => {
        this.store = this.props.core.getStore(this.props.store)
        this.setState({})
      })
    }
  }

  render () {
    if (!this.store) return <div>No store.</div>
    return <Subscriber store={this.store} select={this.props.select} children={this.props.children} init={this.props.init} />
  }
}

const Context = React.createContext()

export const Provider = ({ core, children }) => (
  <Context.Provider value={core}>
    {children}
  </Context.Provider>
)

export class Consumer extends React.PureComponent {
  render () {
    const { children, store, select, init } = this.props
    return (
      <Context.Consumer>
        {(core => {
          if (core.getStore) return <Subscriber store={core.getStore(store)} select={select} children={children} init={init} />
          else return <WaitForStore {...this.props} core={core} />
        })}
      </Context.Consumer>
    )
  }
}
