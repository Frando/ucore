const debug = require('debug')('store')

module.exports = storeLogger

function storeLogger (state, prevState, meta) {
  let update = !(state === prevState)
  const { patches, subscribers, name } = meta

  let lines = []

  if (!update) lines.push('[no changes.]')
  else {
    let action = { type: name }
    if (meta.args && meta.args.length) {
      if (meta.args.length === 1 && typeof meta.args[0] === 'object' && !Array.isArray(meta.args[0])) {
        action = { ...action, ...meta.args[0] }
      }
      else {
        action = {...action, args: meta.args}
      }
    }
    lines.push(['action: %o', action])
    lines.push(['old: %o', prevState])
    lines.push(['new: %o', state])
    if (patches) {
      lines.push(['patches: %o', patches])
    }
    if (subscribers) lines.push(['called %s subscribers (%s)', subscribers.length, subscribers.map(s => s.name).join(', ')])
  }

  if (console.groupCollapsed) {
    console.groupCollapsed(`STATE UPDATE: %s`, name)
    lines.forEach(line => {
      console.log(...line)
    })
    console.groupEnd()
  } else {
    debug('STATE UPDATE: %s', name)
    lines.forEach(line => {
      debug(...line)
    })

  }
}
