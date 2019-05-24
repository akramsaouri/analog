const { ipcRenderer: ipc } = require('electron')

const { formatMinutesDuration, formatDiff } = require('../../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')

class Ticker extends IpcRenderer {
  constructor(name) {
    super(name)
    this.toggleTimer = this.toggleTimer.bind(this)
    this.renderCounter = this.renderCounter.bind(this)
    ipc.on('render-counter', this.renderCounter)
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
    this.emit('bounce-update-back', { receiver: 'dashboard' })
    this.mount()
  }
  renderCounter() {
    const container = document.querySelector('.ticker-duration')
    container.innerText = formatDiff(new Date(), this.timer.launchedAt)
  }
  render() {
    document.querySelector('.ticker-container').innerHTML = `
      <h5 class='ticker-project'>${this.timer.project}</h5>
      <div class='ticker-container-action'>
        <span class='ticker-duration'>${formatMinutesDuration(
          this.timer.lastSessionInMin
        )}</span>
        <button class='ticker-toggle-btn ${
          this.timer.active ? 'ticker-stop-icon' : 'ticker-start-icon'
        } ' />
      </div>
    `
  }
}

module.exports = Ticker
