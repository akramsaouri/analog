const diffInMs = require('date-fns/differenceInMilliseconds')
const format = require('date-fns/format')

exports.formatMinutesDuration = m => {
  const h = m / 60
  let rh = Math.floor(h)
  let rm = String(Math.round((h - rh) * 60))
  rh = String(rh)
  if (rh.length === 1) rh = `0${rh}`
  if (rm.length === 1) rm = `0${rm}`
  return `${rh}:${rm}:00`
}

exports.formatDiff = (after, before) =>
  format(new Date(diffInMs(new Date(after), new Date(before))), 'HH:mm:ss')

exports.formatDateKey = dateKey => {
  let [month, year] = dateKey.split('_')
  month = month[0].toUpperCase() + month.slice(1)
  return `${month} ${year}`
}
