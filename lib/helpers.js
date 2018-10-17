const { join } = require('path')

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

exports.months = months

exports.getMonthKey = d => {
  return months[d.getMonth()]
}

exports.getTrayImage = (timerActive = false) =>
  join(__dirname, `../icons/${timerActive ? 'started' : 'stopped'}Template.png`)
