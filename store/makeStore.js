let produce = require('immer')
let logger = require('../lib/logger')
const util = require('../lib/util')

// I hate the inconsistencies between es modules via rollup and require in node...
// it's really hard these days to write isomorphic code.
if (typeof produce !== 'function') produce = produce.produce
if (typeof logger !== 'function') logger = logger.default

const META = Symbol('ucore-store-meta')

module.exports = makeStore

function makeStore (opts) {
  const {
    initialState = {},
    actions = {},
    select = {},
    compareFunc = defaultCompareFunc,
    name
  } = opts

  const isEqual = compareFunc || defaultCompareFunc
  let subscribers = []
  let state = initialState

  const store = {
    actions: {},
    select: {},
    name
  }

  store.subscribe = (fn, select, ...args) => {
    subscribers.push({ fn, select, args })
    return () => store.unsubscribe(fn)
  }

  store.unsubscribe = func => {
    subscribers = subscribers.filter(({ fn }) => fn === func)
  }

  store.get = () => state

  store.set = (fn, meta = {}) => {
    meta.patches = []
    let newState = produce(state, fn, p => meta.patches.push(p))
    store.setState(newState, meta)
  }

  store.setState = (newState, meta) => {
    let prevState = state
    state = newState
    meta.subscribers = _callSubscribers(newState, prevState)

    logger(newState, prevState, meta)
  }

  store.select = (select, ...args) => _select(state, select, ...args)

  store.decorate = util.makeDecorate(store, 'store')

  Object.keys(actions).forEach(name => {
    let action = _makeAction(actions[name], name)
    store.decorate(name, action, 'action')
    store.actions[name] = store[name]
  })

  Object.keys(select).forEach(name => {
    store.decorate(name, select[name], 'select')
    store.select[name] = store[name]
  })

  return store

  function _makeAction (fn, name) {
    return function (...args) {
      let takeDraft = true
      let patches = []
      let set = fn => store.set(fn, { name, args })

      let maybeNewState = produce(state, (draft) => {
        let res = fn.bind({ draft })(...args)

        if (typeof res === 'function') {
          res.bind(state)(set, { select, ...store })
          takeDraft = false
        }
      }, p => patches.push(p))

      if (takeDraft) {
        store.setState(maybeNewState, { name: name, patches: patches })
      }
    }
  }

  function _select (state, select, ...args) {
    if (!select) {
      return state
    }
    if (Array.isArray(select)) {
      return select.map(sel => _select(state, sel, ...args))
    }
    if (typeof select === 'function') {
      return select(state, ...args)
    }
    if (typeof select === 'string') {
      return store.select[select](state, ...args)
    }
  }

  function _callSubscribers (newState, oldState) {
    let _subscribers = []
    subscribers.forEach(({ fn, select, args }) => {
      let oldSection = _select(oldState, select, ...args)
      let newSection = _select(newState, select, ...args)
      if (!isEqual(oldSection, newSection)) {
        fn(newSection, oldSection, store)
        _subscribers.push(fn)
      }
    })
    return _subscribers
  }
}

function defaultCompareFunc (a, b) {
  return a === b
}
