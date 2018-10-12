const http = require('http')
const server = http.createServer(handle)

const uncore = require('../src')

const rpc = require('../src/rpc/ws-server')

const app = uncore()

app.register(rpc, { server })

app.use(routes)

app.ready((err) => {
  if (err) console.log('ERROR', err)
  else server.listen(10001, () => console.log('Server listening on port 10001.'))
})

app.start()

function routes (app, opts, next) {
  app.take('test', async (req, res) => {
    return req.toUpperCase() + ' world!'
  })

  let cnt = 0
  app.take('node', async req => {
    return 'node-' + cnt++
  })

  next()
}

const fs = require('fs')
const p = require('path')
const url = require('url')
function handle (req, res) {
  const base = p.join(__dirname, 'react')
  let { pathname } = url.parse(req.url)
  if (pathname === '/') pathname = 'index.html'
  if (fs.existsSync(p.join(base, pathname))) {
    const ret = fs.readFileSync(p.join(base, pathname))
    res.writeHead(200)
    res.end(ret)
  } else {
    res.writeHead(404)
    res.end('not found.')
  }
}
