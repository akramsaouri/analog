const { ipcRenderer: ipc } = require('electron')

const { formatMinutesDuration, formatDiff } = require('../../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')
const Timebox = require('./Timebox')

class Ticker extends IpcRenderer {
  constructor(name) {
    super(name)
    this.toggleTimer = this.toggleTimer.bind(this)
    this.renderCounter = this.renderCounter.bind(this)
    this.toggleTimebox = this.toggleTimebox.bind(this)
    ipc.on('render-counter', this.renderCounter)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
  }
  addEvtsListener() {
    document
      .querySelector('#ticker-toggle-btn')
      .addEventListener('click', this.toggleTimer)
    document
      .querySelector('#timebox-toggle-btn')
      .addEventListener('click', this.toggleTimebox)
  }
  toggleTimer() {
    const timebox = this.timer.timeboxed ? new Timebox().getValue() : null
    analog.toggleTimer(null, timebox)
  }
  toggleTimebox() {
    analog.db.set('timer.timeboxed', !this.timer.timeboxed).write()
    this.emit('bounce-update-back', { receiver: 'timebox' })
  }
  renderCounter() {
    const container = document.querySelector('.ticker-duration')
    container.innerText = this.timer.timeboxed
      ? formatDiff(this.timer.dueAt, new Date())
      : formatDiff(new Date(), this.timer.launchedAt)
  }
  render() {
    document.querySelector('.ticker-container').innerHTML = `
      <h5 class='ticker-project'>${this.timer.project}</h5>
      <div class='ticker-container-action'>
        <span class='ticker-duration'>${formatMinutesDuration(
          this.timer.lastSessionInMin
        )}</span>
        <button class='app-btn-icon ${
          this.timer.active ? 'ticker-stop-icon' : 'ticker-start-icon'
        } ' id='ticker-toggle-btn' />
        <button class='app-btn-icon ticker-timer-icon' id='timebox-toggle-btn'/>
      </div>
    `
  }
}

module.exports = Ticker
