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
    this.unsubscribe()
  }

  onUpdate (sel) {
    this.setState({ sel })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // Always update on prop change.
    if (!shallowEqual(cleanProps(this.props), cleanProps(nextProps))) return true
    // Never update if state is the same.
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
      <WithCore>
        {(core => <Subscriber store={core.getStore(store)} {...rest} />)}
      </WithCore>
    )
  }
}

class AsyncCoreProxy extends React.PureComponent {
  componentDidMount () {
    if (!this.props.core.isReady) this.props.core.on('ready', () => this.forceUpdate())
  }

  render () {
    if (!this.props.core.isReady) return <div>Loading</div>
    return this.props.children(this.props.core)
  }
}

export class WithCore extends React.PureComponent {
  render () {
    let { children } = this.props
    return (
      <Context.Consumer>
        {core => {
          return core.isReady ? children(core) : <AsyncCoreProxy core={core} children={children} />
        }}
      </Context.Consumer>
    )
  }
}

export class WithStore extends React.PureComponent {
  render () {
    let { store, children } = this.props
    return (
      <WithCore>
        {core => {
          let realStore = core.getStore(store)
          return children(realStore)
        }}
      </WithCore>
    )
  }
}
