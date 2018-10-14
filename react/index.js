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

const Context = React.createContext()

export const Provider = ({ core, children }) => (
  <Context.Provider value={core}>
    {children}
  </Context.Provider>
)

export class Consumer extends React.PureComponent {
  render () {
    const { children, store, select } = this.props
    return (
      <Context.Consumer>
        {(core => {
          let realStore = core.getStore(store)
          return <Subscriber store={realStore} select={select} children={children} />
        })}
      </Context.Consumer>
    )
  }
}
