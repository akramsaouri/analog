const IpcRenderer = require('../IpcRenderer')
const opn = require('opn')

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
  openDbFile() {
    opn(dbPath)
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
