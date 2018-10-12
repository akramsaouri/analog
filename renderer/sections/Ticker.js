const { getMonthKey } = require('../../lib/helpers')
const { formatMinutesDuration, formatDiff } = require('../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')

class Ticker extends IpcRenderer {
  constructor(name) {
    super(name)
    this.monthKey = getMonthKey(new Date())
    this.toggleTimer = this.toggleTimer.bind(this)
    this.subRenderTicker = this.subRenderTicker.bind(this)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
  }
  addEvtsListener() {
    document
      .querySelector('.ticker-toggle-btn')
      .addEventListener('click', this.toggleTimer)
  }
  toggleTimer() {
    analog.toggleTimer()
    this.emit('bounce_update_back', { receiver: 'dashboard' })
    this.mount()
  }
  subRenderTicker() {
    const container = document.querySelector('.ticker-duration')
    if (this.timer.active) {
      container.innerText = formatDiff(new Date(), this.timer.launchedAt)
      setTimeout(this.subRenderTicker, 1000)
    } else {
      container.innerText = formatMinutesDuration(this.timer.lastSessionInMin)
    }
  }
  render() {
    document.querySelector('.ticker-container').innerHTML = `
      <h5 class='ticker-project'>${this.timer.project}</h5>
      <div>
        <span class='ticker-duration'></span>
        <button class='ticker-toggle-btn'>
        ${this.timer.active ? 'pause' : 'start'}
        </button>
      </div>
    `
    this.subRenderTicker()
  }
}

module.exports = Ticker
