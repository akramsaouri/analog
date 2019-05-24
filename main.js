const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain: ipc,
  Notification,
  Tray
} = require('electron')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const EventEmitter = require('events')
const isDev = require('electron-is-dev')
const { join } = require('path')

const Analog = require('./Analog')
const { getTrayImage } = require('./lib/helpers')

const eventEmitter = new EventEmitter()

// Load dev or prod db file.
let dbPath = isDev
  ? process.cwd()
  : `${process.env.HOME}/Library/Application Support/analog`
dbPath = join(dbPath, '/analog.json')
const db = lowdb(new FileSync(dbPath))
const analog = new Analog(db, eventEmitter)
exports.dbPath = dbPath
exports.analog = analog

let mainWindow, tray

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600, frame: false })
  mainWindow.loadFile('public/index.html')

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  const timer = analog.db.get('timer').value()
  tray = new Tray(getTrayImage(timer.active))
  if (timer.active) {
    tray.setTitle(timer.project)
  }

  tray.on('click', () => {
    // Give app focus when tray is clicked.
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+Shift+A', analog.toggleTimer)
})

app.on('window-all-closed', () => {
  // Quit app when main window is closed.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  const timer = analog.db.get('timer').value()
  if (timer.active) {
    analog.db.set('timer.active', false).write()
  }
  globalShortcut.unregisterAll()
})

ipc.on('bounce-update-back', (_, { receiver }) => {
  // Bounce event back to intended receiver.
  mainWindow.webContents.send('update_' + receiver)
})

eventEmitter.on('event-to-ipc', event => {
  // Proxy event sent through event emitter to ipc listeners
  mainWindow.webContents.send(event)
})

eventEmitter.on('timer-started', ({ project }) => {
  new Notification({
    title: project,
    subtitle: `GO GO GO!`
  }).show()
  // Toggle tray image
  tray.setImage(getTrayImage(true))
  tray.setTitle(project)
  updateSections()
})

eventEmitter.on('timer-stopped', ({ project, lastSessionInMin }) => {
  if (lastSessionInMin >= 1) {
    // No need to show notification on short session.
    new Notification({
      title: project,
      subtitle: `These were some good ${lastSessionInMin} minutes.`
    }).show()
  }
  // Toggle tray image
  tray.setImage(getTrayImage(false))
  tray.setTitle('')
  updateSections()
})

function updateSections() {
  ;['ticker', 'dashboard'].forEach(s =>
    mainWindow.webContents.send('update_' + s)
  )
}
