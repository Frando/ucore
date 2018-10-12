const ws = require('websocket-stream')
const makeRpcPlugin = require('./shared')

module.exports = {
  name: 'rpcServer',
  plugin: makeRpcPlugin(websocketClient)
}

function websocketClient (opts, handle) {
  const websocket = ws(opts.url)
  handle (websocket)

  websocket.on('error', (err) => console.log('ws error', err))
  if (typeof window !== 'undefined') window.addEventListener('beforeunload', () => websocket.close())
}
