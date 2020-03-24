const open = require('open')
const { ipcRenderer: ipc } = require('electron')

const IpcRenderer = require('../IpcRenderer')

const { formatMinutesDuration } = require('../../../lib/formatters')

class Ticker extends IpcRenderer {
  constructor(name) {
    super(name)
    this.openDbFile = this.openDbFile.bind(this)
    this.updateTotalValue = this.updateTotalValue.bind(this)
    this.updateTotalUnit = this.updateTotalUnit.bind(this)
    this.onUpdateFooter = this.onUpdateFooter.bind(this)
    ipc.on('update_footer', this.onUpdateFooter)
    this.minUnit = false
  }
  addEvtsListener() {
    document
      .querySelector('.manage-dashboard-btn')
      .addEventListener('click', this.openDbFile)
    document
      .querySelector('.project-analog-total')
      .addEventListener('click', this.updateTotalUnit)
  }
  onUpdateFooter(_, { totalMs }) {
    this.totalMs = totalMs
    setTimeout(() => {
      // the setTimeout is a necessary hack to wait for the render
      this.updateTotalValue()
    }, 0)
  }
  updateTotalValue() {
    const container = document.querySelector('.project-analog-total')
    container.innerText = this.minUnit
      ? `${this.totalMs}min`
      : formatMinutesDuration(this.totalMs)
  }
  updateTotalUnit() {
    this.minUnit = !this.minUnit
    this.updateTotalValue()
  }
  async openDbFile() {
    await open(dbPath, { wait: true })
    alert('Restart application to apply recent changes.')
  }
  render() {
    document.querySelector('.dashboard-footer').innerHTML = `
      <span class="project-analog-summary">
        <span class="project-analog-label">
          Total:
        </span>
        <span class="project-analog-total">
        </span>
      </span>
      <button class="manage-dashboard-btn">
        manage projects →
      </button>
    `
  }
}

module.exports = Ticker
