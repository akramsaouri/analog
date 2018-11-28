const { getMonthKey, months } = require('../../../lib/helpers')
const { formatMinutesDuration } = require('../../../lib/formatters')
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
    // document
    //   .querySelector('.dashboard-month-select')
    //   .addEventListener('change', this.selectMonth)
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
    const filterHtml = `
        <button class='select-month-btn prev-month'></button>
        <h5 class='filter-month-value'>Dec 2018</h5>
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
          <button data-project-name="${
            p.name
          }" class="project-toggle-btn"></button>
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
      ${listHtml}
    </div>
    `
  }
}

module.exports = Dashboard
