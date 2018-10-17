// Modules to control application life and create native browser window
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
const dbPath = isDev
  ? process.cwd()
  : `${process.env.HOME}/Library/Application Support/analog`
const db = lowdb(new FileSync(join(dbPath, '/analog.json')))

const analog = new Analog(db, eventEmitter)
exports.analog = analog

let mainWindow, tray

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600, show: false })
  mainWindow.loadFile('index.html')

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  tray = new Tray(getTrayImage(analog.db.get('timer').active))

  tray.on('click', () => {
    // Give app focus when tray is clicked.
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
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
  globalShortcut.unregisterAll()
})

ipc.on('bounce_update_back', (_, { receiver }) => {
  // Bounce event back to intended receiver.
  mainWindow.webContents.send('update_' + receiver)
})

eventEmitter.on('timer-started', ({ project }) => {
  new Notification({
    title: project,
    subtitle: `GO GO GO!`
  }).show()
  // Toggle tray image
  tray.setImage(getTrayImage(true))
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
  updateSections()
})

function updateSections() {
  ;['ticker', 'dashboard'].forEach(s =>
    mainWindow.webContents.send('update_' + s)
  )
}
