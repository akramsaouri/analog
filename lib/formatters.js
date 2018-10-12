const diffInMs = require('date-fns/difference_in_milliseconds')
const format = require('date-fns/format')

exports.formatMinutesDuration = m => {
  const h = m / 60
  const rh = Math.floor(h)
  const rm = Math.round((h - rh) * 60)
  return rh + ':' + rm + ''
}

exports.formatDiff = (after, before) =>
  format(new Date(diffInMs(after, before)), 'HH:mm:ss')
