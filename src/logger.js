const debug = require('debug')('store')

module.exports = logger

function logger (state, prevState, meta) {
  let update = !(state === prevState)
  const { patches, subscribers, name } = meta

  debug('STATE UPDATE: ', name)
  if (!update) return console.log('  no changes.')
  let action = { type: name }
  if (meta.args && meta.args[0]) action = { ...action, ...meta.args[0]}
  else if (meta.args) action = { ...action, args: meta.args }
  debug('  action: %o', action)
  if (patches) debug('  patches: %s', patches.length)
  debug('  old: %O', prevState)
  debug('  new: %O', state)
  if (subscribers) debug('  called %s subscribers (%s)', subscribers.length, subscribers.map(s => s.name).join(', '))
}
