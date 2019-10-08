const {
  differenceInMinutes,
  addMinutes,
  isSameSecond,
  isAfter
} = require('date-fns')

const Storage = require('./Storage')
const { getDateKey } = require('./lib/helpers')

class Analog extends Storage {
  constructor(db, emitter) {
    super(db)
    this.emitter = emitter
    this.toggleTimer = this.toggleTimer.bind(this)
    this.tick = this.tick.bind(this)
  }
  toggleTimer(project, timebox) {
    this.timer = this.db.get('timer').value()
    const now = new Date()
    if (this.timer.active) {
      // save session in project
      const sessionInMin = differenceInMinutes(
        now,
        new Date(this.timer.launchedAt)
      )
      this.db
        .get('projects')
        .find({ name: this.timer.project })
        .inc(getDateKey(now), sessionInMin)
        .assign()
        .write()

      // cache last session time
      this.timer.lastSessionInMin = sessionInMin
      this.timer.active = false
      this.timer.timeboxed = false
      this.emitter.emit('timer-stopped', this.timer)
    } else {
      if (project) {
        // project can be empty if timer started by shortcut
        this.timer.project = project
      }
      if (timebox) {
        // schedule dueAt for ticking
        this.timer.dueAt = addMinutes(now, timebox)
      }
      this.timer.launchedAt = now
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
      if (this.timer.timeboxed) {
        // checked if countdown is done
        const isCountdownDone =
          isSameSecond(new Date(this.timer.dueAt), new Date()) ||
          isAfter(new Date(), new Date(this.timer.dueAt))
        if (isCountdownDone) {
          this.toggleTimer()
        }
      }
      setTimeout(this.tick, 1000)
    }
  }
}

module.exports = Analog
