const { getMonthKey } = require('./lib/helpers')
class Storage {
  constructor(db) {
    const defaultState = {
      projects: [
        {
          name: 'Your very first task',
          analogs: {
            [getMonthKey(new Date())]: 0
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
      byMonth: this.byMonth,
      inc: this.inc
    })
  }
  byMonth(arr, month) {
    return arr.map(x => ({
      ...x,
      analogs: x.analogs[month] || 0
    }))
  }
  inc(project, month, analog) {
    if (!project.analogs[month]) {
      project.analogs[month] = 0
    }
    project.analogs[month] += analog
    return project.analogs
  }
}

module.exports = Storage
