const { join } = require('path')

const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec'
]

exports.months = months

exports.getDateKey = d => months[d.getMonth()] + '_' + d.getFullYear()

exports.getTrayImage = (timerActive = false) =>
  join(__dirname, `../icons/${timerActive ? 'started' : 'stopped'}Template.png`)

/**
 * @param {string} dateKey with 'month_year' format
 * @param {enum} direction represents possible nav directions [next, prev]
 */
exports.navigateDateKey = (dateKey, direction) => {
  let [month, year] = dateKey.split('_')
  year = parseInt(year)
  if (direction === 'next') {
    if (month === 'dec') {
      // move to next year
      month = 'jan'
      year = year + 1
    } else {
      month = months[months.indexOf(month) + 1]
    }
  } else if (direction === 'prev') {
    if (month === 'jan') {
      // move to past year (starting with dec of course)
      month = 'dec'
      year = year - 1
    } else {
      month = months[months.indexOf(month) - 1]
    }
  } else {
    throw new Error('invalid direction')
  }
  return `${month}_${year}`
}
