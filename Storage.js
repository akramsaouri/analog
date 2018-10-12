class Storage {
  constructor(db) {
    this.db = db
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
