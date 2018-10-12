let produce = require('immer')
let logger = require('./logger')

// I hate the inconsistencies between es modules via rollup and require in node...
// it's really hard these days to write isomorphic code.
if (typeof produce !== 'function') produce = produce.produce
if (typeof logger !== 'function') logger = logger.default

module.exports = makeStore

function makeStore (initialState, actions, select, opts = {}) {
  const isEqual = opts.compareFunc || defaultCompareFunc
  const store = {}
  let subscribers = []
  let state = initialState

  store.subscribe = (fn, select, ...args) => {
    subscribers.push({ fn, select, args})
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
    if (newState === state) return log(false)
    let prevState = state
    state = newState
    meta.subscribers = _callSubscribers(newState, prevState)

    logger(newState, prevState, meta)
  }


  store.select = (select, ...args) => {
    return _select(state, select, ...args)
  }

  store.decorate = (prop, value) => {
    if (store[prop] === value) return
    if (store.hasOwnProperty(name)) throw new Error(`Cannot decorate ${name}: Already taken.`)
    store[prop] = value
  }

  if (actions) {
    Object.keys(actions).forEach(name => {
      if (store.hasOwnProperty(name)) throw new Error('Cannot define action %s: Already registered', name)
      let fn = actions[name]
      store[name] = _makeAction(fn, name)
    })
  }

  if (select) {
    Object.keys(select).forEach(name => {
      // store.select[name] = (...args) => select[name](state, ...args)
      store.select[name] = select[name]
    })
  }

  return store

  function _makeAction (fn, name) {
    return function (...args) {
      let _takeDraft = true
      let _patches = []
      let set = fn => store.set(fn, { name, args })

      let maybeNewState = produce(state, (draft) => {
        let res = fn.bind({ draft })(...args)

        if (typeof res === 'function') {
          res(set, { select, ...store })
          _takeDraft = false
        }
      }, p => _patches.push(p))

      if (_takeDraft) {
        store.setState(maybeNewState, { name: name, patches: _patches })
      }
    }
  }

  function _select (state, select, ...args) {
    if (!select) return state
    if (typeof select === 'function') return select(state, ...args)
    if (typeof select === 'string') {
      let ret = store.select[select](state, ...args)
      return ret
    }
  }

  function _callSubscribers (newState, oldState) {
    _active = true
    let _subscribers = []
    subscribers.forEach(({ fn, select, args }) => {
      let oldSection = _select(oldState, select, ...args)
      let newSection = _select(newState, select, ...args)
      if (!isEqual(oldSection, newSection)) {
        fn(newSection, store)
        _subscribers.push(fn)
      }
    })
    _active = false
    return _subscribers
  }
}

function defaultCompareFunc (a, b) {
  return a === b
}
