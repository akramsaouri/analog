// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain: ipc,
  Notification
} = require('electron')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const EventEmitter = require('events')
const menubar = require('menubar')
const { join } = require('path')

const Analog = require('./Analog')

const eventEmitter = new EventEmitter()
const db = lowdb(new FileSync('/Users/akram/Documents/analog.json'))
const analog = new Analog(db, eventEmitter)
const mb = menubar({
  icon: analog.db.get('timer').value().active
    ? join(__dirname, './icons/started.png')
    : join(__dirname, './icons/stopped.png')
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // register global shortcut listener
  globalShortcut.register('CommandOrControl+Shift+A', analog.toggleTimer)

  // register ipc listener used to bounce updates back to renderer
  ipc.on('bounce_update_back', (_, { receiver }) => {
    mainWindow.webContents.send('update_' + receiver)
  })

  eventEmitter.on('timer-started', ({ project }) => {
    new Notification({
      title: project,
      subtitle: `GO GO GO!`
    }).show()
    mb.tray.setImage(join(__dirname, './icons/started.png'))
  })

  eventEmitter.on('timer-stopped', ({ project, lastSessionInMin }) => {
    if (lastSessionInMin > 1) {
      new Notification({
        title: project,
        subtitle: `These were some good ${lastSessionInMin} minutes.`
      }).show()
    }
    mb.tray.setImage(join(__dirname, './icons/started.png'))
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

exports.analog = analog
