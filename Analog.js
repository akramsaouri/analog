const diffInMin = require('date-fns/difference_in_minutes')

const Storage = require('./Storage')
const { getMonthKey } = require('./lib/helpers')

class Analog extends Storage {
  constructor(db, emitter) {
    super(db)
    this.emitter = emitter
    this.toggleTimer = this.toggleTimer.bind(this)
  }
  toggleTimer() {
    let timer = this.db.get('timer').value()
    if (!timer.project) {
      throw new Error('Cannot toggle timer with unset project name.')
    }
    if (timer.active) {
      // save session in project
      const d = new Date()
      const sessionInMin = diffInMin(d, timer.launchedAt)
      this.db
        .get('projects')
        .find({ name: timer.project })
        .inc(getMonthKey(new Date()), sessionInMin)
        .assign()
        .write()

      // cache last session time
      timer.lastSessionInMin = sessionInMin
      timer.active = false
      this.emitter.emit('timer-stopped', timer)
    } else {
      timer.launchedAt = new Date()
      timer.active = true
      this.emitter.emit('timer-started', timer)
    }
    this.db.set('timer', timer).write()
    return timer
  }
}

module.exports = Analog
