const hyperpc = require('hyperpc')
const pump = require('pump')
const util = require('../lib/util')
const debug = require('debug')('ucore-rpc')

module.exports = makeRpcPlugin

function makeRpcPlugin (makeStream) {
  return function (core, opts, done) {
    return rpcPlugin(makeStream, core, opts, done)
  }
}

function rpcPlugin (makeStream, core, opts, done) {
  const listeners = {}

  const rpc = {
    reply (name, fn) { 
      listeners[name] = fn.bind(core) 
    },

    async request (name, req, opts) {
      const res = await doRequest(name, req)
      return res
    }
  }

  core.decorate('rpc', rpc)

  let [onStream, remoteApi] = makeRpcHandler(onRequest)
  makeStream(core, opts, onStream)

  done()

  function doRequest (type, req) {
    return new Promise (async function (resolve, reject) {
      const api = await remoteApi
      req = req || {}
      const { stream, ...data } = req
      api.request(type, data, stream, onReply)

      function onReply (type, err, data, stream) {
        if (err) reject(err)
        else resolve({ type, stream, ...data })
      }
    })


  }

  async function onRequest (type, data, stream, session, reply) {
    if (!listeners[type]) return debug('Unhandled request: ' + type)
    const req = { type, stream, session, ...data }
    try {
      const promise = listeners[type](req, done)
      if (promise && typeof promise.then === 'function') {
        let result = await promise
        done(null, result)
      }
    } catch (err) {
      done(err)
    }

    function done (err, res) {
      res = res || {}
      let {
        stream,
        session,
        ...data
      } = res

      reply(type, err, data, stream)
    }
  }

  function makeRpcHandler (onRequest) {
    let resolveRemoteApi
    let remoteApi = new Promise(resolve => {resolveRemoteApi = resolve})
    return [onStream, remoteApi]

    function onStream (stream) {
      const session = {}
      let rpcStream = hyperpc({
        request: (type, data, stream, reply) => onRequest(type, data, stream, session, reply)
      })
      pump(rpcStream, stream, rpcStream)
      rpcStream.on('remote', remote => resolveRemoteApi(remote))
    }
  }
}


// function req (raw, stream) {
//   let req = {
//     log: [],
//     error: false,
//     data: raw.data || null,
//     stream: raw.stream || null
//   }

//   req.decorate = util.makeDecorate(req, 'request')

//   Object.defineProperty(req, 'raw', {
//     get: () => raw
//   })
// }
