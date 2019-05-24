const IpcRenderer = require('../IpcRenderer')
const open = require('open')

class Ticker extends IpcRenderer {
  constructor(name) {
    super(name)
    this.openDbFile = this.openDbFile.bind(this)
  }
  addEvtsListener() {
    document
      .querySelector('.manage-dashboard-btn')
      .addEventListener('click', this.openDbFile)
  }
  async openDbFile() {
    await open(dbPath, { wait: true })
    alert('Restart application to apply recent changes.')
  }
  render() {
    document.querySelector('.dashboard-footer').innerHTML = `
      <button class="manage-dashboard-btn">
        manage projects →
      </button>
    `
  }
}

module.exports = Ticker
