const { getDateKey } = require('./lib/helpers')
class Storage {
  constructor(db) {
    const currentDateKey = getDateKey(new Date())
    const defaultState = {
      projects: [
        {
          name: 'Your very first task',
          analogs: {
            [currentDateKey]: 0
          }
        }
      ],
      timer: {
        project: 'Your very first task',
        active: false,
        lastSessionInMin: 0,
        launchedAt: new Date()
      }
    }
    this.db = db
    this.db.defaults(defaultState).write()
    this.db._.mixin({
      byDate: this.byDate,
      inc: this.inc,
      sortByActive: this.sortByActive
    })
  }
  byDate(arr, dateKey) {
    return (
      arr
        // pick analog entries for selected date
        .map(x => ({
          ...x,
          analogs: x.analogs[dateKey] || 0
        }))
        // filter no longer active projects
        .filter(x => !x.archived)
    )
  }
  sortByActive(arr) {
    // sort by most active projects to less active ones
    //! this fn assumes analogs are grouped by date
    return arr.sort((p1, p2) => (p1.analogs > p2.analogs ? -1 : 1))
  }
  inc(project, date, analog) {
    if (!project.analogs[date]) {
      project.analogs[date] = 0
    }
    project.analogs[date] += analog
    return project.analogs
  }
}

module.exports = Storage
