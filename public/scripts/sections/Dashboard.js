const { getDateKey, navigateDateKey } = require('../../../lib/helpers')

const {
  formatMinutesDuration,
  formatDateKey
} = require('../../../lib/formatters')
const IpcRenderer = require('../IpcRenderer')
const Timebox = require('./Timebox')

class Dashboard extends IpcRenderer {
  constructor(name) {
    super(name)
    this.dateKey = getDateKey(new Date())
    this.toggleProject = this.toggleProject.bind(this)
    this.selectDate = this.selectDate.bind(this)
    this.resetDate = this.resetDate.bind(this)
    this.sortByCurrentlyActive = this.sortByCurrentlyActive.bind(this)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
    const projects = analog.db.get('projects')
    this.projects = projects
      .byDate(this.dateKey)
      .sortByActive()
      .value()
      // put active projectin top
      .sort(p => ((p.name === this.timer.project) === name ? -1 : 1))
    if (this.timer.active) {
      this.projects = this.projects.sort(this.sortByCurrentlyActive)
    }
    const totalInMs = this.projects.reduce(
      (acc, project) => acc + project.analogs,
      0
    )
    this.emit('bounce-update-back', { receiver: 'footer', totalInMs })
  }
  sortByCurrentlyActive(project) {
    return this.timer.project === project.name ? -1 : 0
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
    const timebox = this.timer.timeboxed ? new Timebox().getValue() : null
    const { projectName } = target.dataset
    analog.toggleTimer(projectName, timebox)
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
      <h5 class='list-header'>Active Projects</h5>
      <div>${listHtml}</div>
    </div>
    `
  }
}

module.exports = Dashboard
