const uncore = require('../src')
const makeStore = require('../src/makeStore')
const rpc = require('../src/rpc/ws-client')

module.exports = start
start()

function start () {
  const app = uncore()
  app.register(rpc, { url: 'ws://localhost:10001' })
  app.use(counterPlugin)
  boot(app)
  return app
}

async function boot (app) {
  try {
    await app.ready()
    const counter = app.getStore('counter')
    counter.increment()
    counter.increment()
    counter.loadNode()
    counter.loadNode()
  } catch (e) {
    console.log('ERROR', e)
  }
}

async function counterPlugin (app) {
  const store = counterStore()
  app.addStore('counter', store)
}

function counterStore () {
  const initialState = {
    counter: 0,
    nodes: []
  }

  const increment = () => set => set((draft) => {
    draft.counter++
  })

  const loadNode = () => (set, { core }) => {
    // const node = await core.fetch('node')
    // update(draft => void draft.nodes.push(node))
    core.fetch('node')
      .then(node => set(draft => void draft.nodes.push(node)))
  }

  const actions = {
    increment,
    loadNode
  }

  const select = {
    firstNode: state => {
      let node = state.nodes[0]
      console.log('getFirstNode!', node)
      return node
    },
    lastNode: state => {
      return state.nodes[state.nodes.length - 1]
    }
  }

  const store = makeStore(initialState, actions, select)

  return store
}
