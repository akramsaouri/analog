const { getMonthKey, months } = require('../../lib/helpers')
const { formatMinutesDuration } = require('../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')

class Dashboard extends IpcRenderer {
  constructor(name) {
    super(name)
    this.monthKey = getMonthKey(new Date())
    this.toggleProject = this.toggleProject.bind(this)
    this.selectMonth = this.selectMonth.bind(this)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
    this.projects = analog.db
      .get('projects')
      .byMonth(this.monthKey)
      .value()
  }
  addEvtsListener() {
    document.querySelectorAll('.project-toggle-btn').forEach(elm => {
      elm.addEventListener('click', this.toggleProject)
    })
    document
      .querySelector('.dashboard-month-select')
      .addEventListener('change', this.selectMonth)
  }
  toggleProject({ target }) {
    const { projectName } = target.dataset
    analog.db.set('timer.project', projectName).write()
    analog.toggleTimer()
    this.emit('bounce_update_back', { receiver: 'ticker' })
    this.mount()
  }
  selectMonth({ target }) {
    const { value } = target
    this.monthKey = value
    this.mount()
  }
  render() {
    const listHtml = this.projects
      .map(p => {
        const active = this.timer.active && this.timer.project === p.name
        return `
      <li>${p.name}:   ${formatMinutesDuration(p.analogs)} 
      <button data-project-name="${p.name}" class="project-toggle-btn"> 
      ${active ? 'pause' : 'start'}
      </button>
      </li>
      `
      })
      .join('')
    const optsHml = months.map(
      x =>
        `<option value="${x}" ${this.monthKey === x ? 'selected' : ''}>
        ${x}
      </option>`
    )
    document.querySelector('.dashboard-container').innerHTML = `
        <h4>Details</h4>
        <select class="dashboard-month-select">
          ${optsHml}
        </select>
        <ul class='project-list'>
        ${listHtml}
        </ul>
      `
  }
}

module.exports = Dashboard
