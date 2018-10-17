const { join } = require('path')
const { readdirSync } = require('fs')

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

const sectionsPath = '../renderer/sections/'
const requireSection = (o, name) => {
  o[name.replace('.js', '')] = require(sectionsPath + name)
  return o
}
exports.loadSections = () =>
  readdirSync(join(__dirname, sectionsPath)).reduce(requireSection, {})
