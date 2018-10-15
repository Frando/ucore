const avvio = require('avvio')
const util = require('./lib/util')
const thunky = require('thunky')

module.exports = ucore 

function ucore (opts) {
  const ucore = {}

  const app = avvio(ucore)

  ucore.plugins = []

  ucore.decorate = util.makeDecorate(ucore)

  ucore.register = (plugin, opts) => {
    ucore.plugins.push(plugin)
    ucore.use(plugin.plugin, opts)
  }

  return ucore
}
