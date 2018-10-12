import React from 'react'
import ReactDOM from 'react-dom'

import client from '../client.js'
import { Provider, Consumer } from '../../src/react/index.js'

const app = client()

const App = () => (
  <Provider core={app}>
    <Consumer store='counter' select={state => state.counter}>
      {(count) => <p>COUNT: {count} </p>}
    </Consumer>
    <Consumer store='counter' select={state => state.nodes}>
      {(nodes) => <p>Node count: {nodes.length} </p>}
    </Consumer>
    <Consumer store='counter' select='firstNode'>
      {(node) => <p>First node: {node} </p>}
    </Consumer>
    <Consumer store='counter' select='lastNode'>
      {(node) => <p>Last node: {node} </p>}
    </Consumer>
    <Consumer store='counter'>
      {(state, { increment, loadNode }) => {
        return (
          <div>
            <p>{state.counter}</p>
            <ul>{state.nodes.map(node => <li key={node}>{node}</li>)}</ul>
            <button onClick={e => increment()}>Increment</button>
            <button onClick={e => loadNode()}>Load node</button>
          </div>
        )}}
    </Consumer>
  </Provider>
)

app.ready(() => {
  ReactDOM.render(<App />, document.querySelector('div'))
})

