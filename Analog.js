const diffInMin = require('date-fns/difference_in_minutes')

const Storage = require('./Storage')
const { getDateKey } = require('./lib/helpers')

class Analog extends Storage {
  constructor(db, emitter) {
    super(db)
    this.emitter = emitter
    this.toggleTimer = this.toggleTimer.bind(this)
  }
  toggleTimer() {
    const timer = this.db.get('timer').value()
    if (!timer.project) {
      throw new Error('Cannot toggle timer with unset project name.')
    }
    const d = new Date()
    d.setHours(d.getHours() + 1) // https://www.facebook.com/mario055/videos/1082357278612670/
    if (timer.active) {
      // save session in project
      const sessionInMin = diffInMin(d, timer.launchedAt)
      this.db
        .get('projects')
        .find({ name: timer.project })
        .inc(getDateKey(d), sessionInMin)
        .assign()
        .write()

      // cache last session time
      timer.lastSessionInMin = sessionInMin
      timer.active = false
      this.emitter.emit('timer-stopped', timer)
    } else {
      timer.launchedAt = d
      timer.active = true
      this.emitter.emit('timer-started', timer)
    }
    this.db.set('timer', timer).write()
    return timer
  }
}

module.exports = Analog
