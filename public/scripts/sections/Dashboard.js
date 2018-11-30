const { getDateKey, navigateDateKey } = require('../../../lib/helpers')
const {
  formatMinutesDuration,
  formatDateKey
} = require('../../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')

class Dashboard extends IpcRenderer {
  constructor(name) {
    super(name)
    this.dateKey = getDateKey(new Date())
    this.toggleProject = this.toggleProject.bind(this)
    this.selectDate = this.selectDate.bind(this)
    this.resetDate = this.resetDate.bind(this)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
    this.projects = analog.db
      .get('projects')
      .byDate(this.dateKey)
      .value()
  }
  addEvtsListener() {
    document.querySelectorAll('.project-toggle-btn').forEach(btn => {
      btn.addEventListener('click', this.toggleProject)
    })
    document.querySelectorAll('.select-month-btn').forEach(btn => {
      btn.addEventListener('click', this.selectDate)
    })
    document
      .querySelector('.filter-month-value')
      .addEventListener('click', this.resetDate)
  }
  toggleProject({ target }) {
    const { projectName } = target.dataset
    analog.db.set('timer.project', projectName).write()
    analog.toggleTimer()
    this.emit('bounce_update_back', { receiver: 'ticker' })
    this.mount()
  }
  selectDate({ target }) {
    // induce direction from clicked button
    const direction = target.classList.contains('prev-month') ? 'prev' : 'next'
    this.dateKey = navigateDateKey(this.dateKey, direction)
    this.mount()
  }
  resetDate() {
    this.dateKey = getDateKey(new Date())
    this.mount()
  }
  render() {
    const filterHtml = `
        <button class='select-month-btn prev-month'></button>
        <div class='filter-month-value'>${formatDateKey(this.dateKey)}</div>
        <button class='select-month-btn next-month'></button>
    `
    const listHtml = this.projects
      .map(p => {
        const active = this.timer.active && this.timer.project === p.name
        return `
      <div class='project-item'>
        <span class='project-name'>${p.name}</span>
        <div class='project-details'>
          <span class='project-analog'>${formatMinutesDuration(
            p.analogs
          )}</span>
          <button data-project-name="${p.name}" class="project-toggle-btn ${
          active ? 'project-active-icon' : 'project-inactive-icon'
        }"></button>
        </div>
      </div>
      `
      })
      .join('')
    document.querySelector('.dashboard-container').innerHTML = `
    <div class='dashboard-filter'>
      ${filterHtml}
    </div>
    <div class='dashboard-list'>
      <h5 class='list-header'>Active projects</h5>
      <div>${listHtml}</div>
    </div>
    `
  }
}

module.exports = Dashboard
