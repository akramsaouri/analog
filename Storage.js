const { getMonthKey } = require('./lib/helpers')
class Storage {
  constructor(db) {
    const defaultState = {
      projects: [
        {
          name: 'the next big thing',
          analogs: {
            [getMonthKey(new Date())]: 350
          }
        }
      ],
      timer: {
        project: 'the next big thing',
        active: false,
        lastSessionInMin: 15,
        launchedAt: new Date()
      }
    }
    this.db = db
    this.db
      .defaults(defaultState)
      .write()
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
