import React from 'react'

export class Subscriber extends React.PureComponent {
  constructor (props) {
    super()
    this.state = { state: props.store.select(props.select) }
    this.onUpdate = this.onUpdate.bind(this)
  }

  componentDidMount () {
    this.props.store.subscribe(this.onUpdate, this.props.select)
  }

  componentWillUnmount () {
    this.props.store.unsubscribe(this.onUpdate)
  }

  onUpdate (state) {
    if (this.props.select === 'firstNode') console.log('UPPPPPPPPPPPPPPPPPPP', state)
    this.setState({ state })
  }

  render () {
    const { children, store } = this.props
    const { state } = this.state
    return typeof children === 'function' ? children(state, store) : children
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
