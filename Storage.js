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
      inc: this.inc
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
  inc(project, date, analog) {
    if (!project.analogs[date]) {
      project.analogs[date] = 0
    }
    project.analogs[date] += analog
    return project.analogs
  }
}

module.exports = Storage
