'use strict'

import { app, protocol, BrowserWindow, ipcMain, Menu, Tray, screen, globalShortcut } from 'electron'
import path from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Storage from './Storage'
import Timer from "./Timer"

const isDevelopment = process.env.NODE_ENV !== 'production'

const store = new Storage({
  configName: 'user-preferences',
  defaults: {
    time: -1,
    yiyan: "随机",
    userDefinedText: "",
    autoStart: false,
  }
})

let renderEvent: any = null;
ipcMain.on("viewer-ready", (event: any) => {
  renderEvent = event;
})

const showWindow = () => {
  renderEvent && renderEvent.reply('random')
  window && window.show()
}

const timer = new Timer(store.get("time"), showWindow)


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


let window: BrowserWindow | null = null;

async function createWindow() {
  const { width, height } = screen.getAllDisplays()[0].size
  // Create the browser window.
  window = new BrowserWindow({
    x: width - 410,
    y: height - 640,
    width: 400,
    height: 600,
    frame: false,

    // parent: top, 
    modal: true,
    icon: __dirname + '/icon.png',
    simpleFullscreen: false,
    alwaysOnTop: true,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true
    }
  })

  const query = `?time=${store.get("time")}&yiyan=${store.get("yiyan")}&userDefinedText=${store.get("userDefinedText")}`

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string + "/#/viewer" + query)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    window.loadURL('app://./index.html#/viewer' + query)
  }

  window.hide()

  ipcMain.emit("put-in-tray")
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }

  // appIcon && appIcon.destroy()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  globalShortcut.register("Alt+F1", () => {
    renderEvent && renderEvent.reply('show-by-hand')
    window && window.show()
  })
})

let appIcon: Tray | null = null;
ipcMain.on('put-in-tray', (event) => {
  const trayIcnPath = process.env.WEBPACK_DEV_SERVER_URL  
    ? path.join(__dirname, `../public/img/tray.png`)
    : path.join(__dirname, `../app.asar/img/tray.png`);


  appIcon = new Tray(trayIcnPath)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示 (Alt+F1 快捷键)",
      click() {
        renderEvent && renderEvent.reply('show-by-hand')
        window && window.show()
      }
    },
    {
      label: "设置",
      click() {
        showSettingPanel()
      },
    }, {
      label: "关闭",
      click() {
        window && window.destroy()
        appIcon && appIcon.destroy()
        settingWindow && settingWindow.destroy()

        if (process.platform !== 'darwin') {
          app.quit()
        }
      }
    },
  ])

  appIcon.setToolTip('郭麒麟鼓励师v1.0')
  appIcon.setContextMenu(contextMenu)
})

ipcMain.on('remove-tray', () => {
  appIcon && appIcon.destroy()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


let settingWindow: BrowserWindow | null = null

async function showSettingPanel() {
  settingWindow = new BrowserWindow({
    width: 800,
    height: 550,
    modal: true,
    icon: __dirname + '/icon.png',
    frame: false,
    // simpleFullscreen: false,
    // alwaysOnTop: true,

    webPreferences: {
      // devTools: false,
      nodeIntegration: true
    }
  })

  const query = `?time=${store.get("time")}&yiyan=${store.get("yiyan")}&userDefinedText=${store.get("userDefinedText")}&autoStart=${store.get("autoStart")}`

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await settingWindow.loadURL((process.env.WEBPACK_DEV_SERVER_URL as string) + "/#/setting" + query)
    if (!process.env.IS_TEST) settingWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await settingWindow.loadURL('app://./index.html#/setting' + query)
  }
}

ipcMain.on("close-setting", (event: any) => {
  settingWindow && settingWindow.destroy()
})

const exePath = process.execPath;

ipcMain.on('save-setting', (event: any, time, yiyan, userDefinedText, autoStart) => {
  store.set("time", time)
    .set("yiyan", yiyan)
    .set("userDefinedText", userDefinedText)
    .set("autoStart", !!autoStart)
    .save()

  app.setLoginItemSettings({
    openAtLogin: !!autoStart,
    path: exePath,
    args: []
  })

  timer.restart(time, showWindow)
  renderEvent && renderEvent.reply("new-setting", yiyan, userDefinedText)
  settingWindow && settingWindow.destroy()
})


ipcMain.on("hide-viewer", (event: any) => {
  window && window.hide()
})
