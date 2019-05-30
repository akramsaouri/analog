const { ipcRenderer: ipc } = require('electron')

class IpcRenderer {
  constructor(name) {
    this.name = name
    this.mount = this.mount.bind(this)
    this.subscribe = this.subscribe.bind(this)
  }
  subscribe() {
    if (this.subscribed) {
      // return early if component is already subscribed to ipc
      return
    }
    ipc.on('update_' + this.name, this.mount)
    this.subscribed = true
  }
  emit(event, args) {
    ipc.send(event, args)
  }
  mount() {
    // console.log('mounting ' + this.name + ' do we need it?');
    const fns = ['fetch', 'subscribe', 'render', 'addEvtsListener']
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i]
      if (this[fn]) {
        this[fn]()
      }
    }
  }
}

module.exports = IpcRenderer
