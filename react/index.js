import React from 'react'
import shallowEqual from 'shallowequal'

const cleanProps = (props) => {
  let {
    children,
    store,
    select,
    init,
    ...rest
  } = props
  return rest
}

export class Subscriber extends React.Component {
  constructor (props) {
    super()
    const sel = props.store.select(props.select, cleanProps(props))
    this.state = { sel }
    this.onUpdate = this.onUpdate.bind(this)
  }

  componentDidMount () {
    this.subscribe()
  }

  subscribe () {
    if (this.unsubscribe) this.unsubscribe()
    this.unsubscribe = this.props.store.subscribe(this.onUpdate, this.props.select, cleanProps(this.props))
    if (this.props.init) {
      this.props.store.actions[this.props.init](cleanProps(this.props))
    }
  }

  componentWillUnmount () {
    if (this.unsubscribe) this.unsubscribe()
    // this.props.store.unsubscribe(this.onUpdate)
  }

  onUpdate (sel) {
    this.setState({ sel })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!shallowEqual(this.props, nextProps)) return true
    if (shallowEqual(this.state.sel, nextState.sel)) return false
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    if (!shallowEqual(prevProps, this.props)) this.subscribe()
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
    const { store, ...rest } = this.props
    return <Subscriber store={this.store} {...rest} />
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
    const { store, ...rest } = this.props
    return (
      <Context.Consumer>
        {(core => {
          if (core.getStore) return <Subscriber store={core.getStore(store)} {...rest} />
          else return <WaitForStore {...this.props} core={core} />
        })}
      </Context.Consumer>
    )
  }
}
