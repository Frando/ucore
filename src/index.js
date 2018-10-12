const avvio = require('avvio')
// const EventEmitter = require('events').EventEmitter

module.exports = uncore

function uncore () {
  // if (!(this instanceof Uncore)) return new Uncore()

  const uncore = {}

  const app = avvio(uncore)

  uncore.stores = []
  uncore.plugins = []

  uncore.decorate = decorate

  uncore.addStore = (name, store) => {
    store.decorate('core', uncore)
    uncore.stores[name] = store
  }

  uncore.getStore = name => uncore.stores[name]

  uncore.register = (plugin, opts) => {
    uncore.plugins.push(plugin)
    uncore.use(plugin.plugin, opts)
  }

  uncore.start = async function () {
    // resolve deps..
    await app.start()
  }

  return uncore

  function decorate (name, fn) {
    if (uncore[name] === fn) return
    if (uncore[name]) throw new Error(`Cannot decorate ${name}: Already taken.`)
    uncore[name] = fn
  }
}
