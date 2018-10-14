const hyperpc = require('hyperpc')
const pump = require('pump')

module.exports = makeRpcPlugin

function makeRpcPlugin (makeStream) {
  return function (core, opts, done) {
    return rpcPlugin(makeStream, core, opts, done)
  }
}

function rpcPlugin (makeStream, core, opts, done) {
  makeStream(opts, handle)

  let resolveRemoteApi
  let remoteApi = new Promise((resolve, reject) => (resolveRemoteApi = resolve))

  const listeners = {}

  core.decorate('reply', (name, fn) => {
    listeners[name] = fn.bind(core)
  })

  core.decorate('request', async function (name, req, opts) {
    const res = await remoteAction(name, req)
    return res
  })

  core.decorate

  core.decorate('session', {})

  done()


  function remoteAction (name, req) {
    return new Promise (async function (resolve, reject) {
      const api = await remoteApi
      api.action(name, req, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }

  async function onAction (name, req, cb) {
    if (!listeners[name]) return console.log('Unhandled request: ' + name)
    try {
      const promise = listeners[name](req, cb)
      if (promise && typeof promise.then === 'function') {
        cb(null, await promise)
      }
    } catch (e) {
      console.log('CAUGHT', e)
      cb(e)
    }
  }

  function handle (stream) {
    let rpcStream = hyperpc({
      action: (name, req, cb) => onAction(name, req, cb)
    })
    pump(rpcStream, stream, rpcStream)
    rpcStream.on('remote', (remote) => {
      resolveRemoteApi(remote)
    })
  }
}