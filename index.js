const avvio = require('avvio')
const util = require('./lib/util')

module.exports = ucore 

function ucore (opts) {
  const ucore = {}

  const app = avvio(ucore)

  ucore.stores = {}
  ucore.plugins = []

  ucore.decorate = util.makeDecorate(ucore)

  ucore.addStore = (name, store) => {
    store.decorate('core', ucore)
    store.name = name
    ucore.stores[name] = store
  }

  ucore.getStore = name => ucore.stores[name]

  ucore.register = (plugin, opts) => {
    ucore.plugins.push(plugin)
    ucore.use(plugin.plugin, opts)
  }

  return ucore

  function decorate (name, value) {
    if (ucore.hasOwnProperty(name)) {
      throw new Error(`Cannot decorate ${name}: Already taken.`)
    }
    Object.defineProperty(ucore, name, { value, enumerable: true })
  }
}
