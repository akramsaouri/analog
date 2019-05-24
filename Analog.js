const diffInMin = require('date-fns/difference_in_minutes')

const Storage = require('./Storage')
const { getDateKey } = require('./lib/helpers')

class Analog extends Storage {
  constructor(db, emitter) {
    super(db)
    this.emitter = emitter
    this.toggleTimer = this.toggleTimer.bind(this)
    this.tick = this.tick.bind(this)
  }
  toggleTimer() {
    this.timer = this.db.get('timer').value()
    const d = new Date()
    d.setHours(d.getHours())
    if (this.timer.active) {
      // save session in project
      const sessionInMin = diffInMin(d, this.timer.launchedAt)
      this.db
        .get('projects')
        .find({ name: this.timer.project })
        .inc(getDateKey(d), sessionInMin)
        .assign()
        .write()

      // cache last session time
      this.timer.lastSessionInMin = sessionInMin
      this.timer.active = false
      this.emitter.emit('timer-stopped', this.timer)
    } else {
      this.timer.launchedAt = d
      this.timer.active = true
      this.emitter.emit('timer-started', this.timer)
      this.tick()
    }
    this.db.set('timer', this.timer).write()
    return this.timer
  }
  tick() {
    if (this.timer.active) {
      this.emitter.emit('event-to-ipc', 'render-counter')
      // if countdown is done
      //   stop timer
      setTimeout(this.tick, 1000)
    }
  }
}

module.exports = Analog
