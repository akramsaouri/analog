const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain: ipc,
  Notification,
  Tray,
  Menu
} = require('electron')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const EventEmitter = require('events')
const isDev = require('electron-is-dev')
const { join } = require('path')
const { rename } = require('fs')
const Settings = require('electron-store')

const Analog = require('./Analog')
const { getTrayImage } = require('./lib/helpers')
const { template } = require('./menu')

const eventEmitter = new EventEmitter()
const settingsConfig = {
  name: 'settings',
  defaults: {
    dbPath: app.getPath('userData')
  },
  schema: {
    dbPath: {
      type: 'string'
    }
  }
}
if (isDev) {
  // use local settings file on dev
  settingsConfig.cwd = process.cwd()
  // use local db file on dev
  settingsConfig.defaults.dbPath = process.cwd()
}
const settings = new Settings(settingsConfig)
// Load dev or prod db file.
const dbPath = join(settings.get('dbPath'), '/analog.json')
const db = lowdb(new FileSync(dbPath))
const analog = new Analog(db, eventEmitter)
exports.dbPath = dbPath
exports.analog = analog
exports.settings = settings

let mainWindow, tray, settingsWindow

function createMainWindow() {
  // Init menu
  const preferences = {
    label: 'Preferences',
    accelerator: 'CmdOrCtrl+,',
    click: createSettingsWindow
  }
  // prepend preferences to menu template
  template[0].submenu.unshift(preferences)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Init window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: { nodeIntegration: true }
  })
  mainWindow.loadFile('public/index.html')

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // recover tray state
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

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 250,
    webPreferences: { nodeIntegration: true }
  })
  settingsWindow.loadFile('public/settings.html')

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

app.on('ready', createMainWindow)

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
  // Force section to re-render by bouncing event back to intended receiver
  mainWindow.webContents.send('update_' + receiver)
})

eventEmitter.on('event-to-ipc', event => {
  // Proxy event sent through event emitter to ipc listeners
  mainWindow.webContents.send(event)
})

eventEmitter.on('timer-started', ({ project, lastSessionInMin, timeboxed }) => {
  new Notification({
    title: project,
    subtitle:
      timeboxed && lastSessionInMin
        ? `${lastSessionInMin}min to go.`
        : 'Gambatte!'
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
  ;['ticker', 'dashboard', 'timebox'].forEach(s =>
    mainWindow.webContents.send('update_' + s)
  )
}

settings.onDidChange('dbPath', (newPath, oldPath) => {
  if (newPath === oldPath) return
  rename(join(oldPath, '/analog.json'), join(newPath, '/analog.json'), err => {
    if (err) {
      // revert on error
      settings.set('dbPath', oldPath)
      return console.log(err)
    }
    app.quit()
  })
})
