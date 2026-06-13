const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'
const userDataPath = app.getPath('userData')
const documentsPath = app.getPath('documents')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#2c241b',
    title: '复古打字机',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../public/icon.png')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('save-document', async (event, data) => {
  try {
    const savePath = path.join(userDataPath, 'documents.json')
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-documents', async () => {
  try {
    const savePath = path.join(userDataPath, 'documents.json')
    if (fs.existsSync(savePath)) {
      const data = fs.readFileSync(savePath, 'utf-8')
      return { success: true, data: JSON.parse(data) }
    }
    return { success: true, data: [] }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
})

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json')
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-settings', async () => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json')
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8')
      return { success: true, data: JSON.parse(data) }
    }
    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: error.message, data: null }
  }
})

ipcMain.handle('export-txt', async (event, content, defaultName) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出为纯文本',
      defaultPath: path.join(documentsPath, `${defaultName || '未命名'}.txt`),
      filters: [{ name: '纯文本文件', extensions: ['txt'] }]
    })

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, content, 'utf-8')
      shell.showItemInFolder(result.filePath)
      return { success: true, path: result.filePath }
    }
    return { success: false, canceled: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('export-pdf', async (event, htmlContent, defaultName) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出为 PDF',
      defaultPath: path.join(documentsPath, `${defaultName || '未命名'}.pdf`),
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
    })

    if (!result.canceled && result.filePath) {
      const pdfWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          contextIsolation: true
        }
      })

      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
      
      const pdfData = await pdfWindow.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: {
          top: 0.5,
          bottom: 0.5,
          left: 0.75,
          right: 0.75
        }
      })

      fs.writeFileSync(result.filePath, pdfData)
      pdfWindow.close()
      shell.showItemInFolder(result.filePath)
      return { success: true, path: result.filePath }
    }
    return { success: false, canceled: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('toggle-fullscreen', async () => {
  if (mainWindow) {
    const isFull = mainWindow.isFullScreen()
    mainWindow.setFullScreen(!isFull)
    return !isFull
  }
  return false
})

ipcMain.handle('save-typing-history', async (event, data) => {
  try {
    const savePath = path.join(userDataPath, 'typing-history.json')
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-typing-history', async () => {
  try {
    const savePath = path.join(userDataPath, 'typing-history.json')
    if (fs.existsSync(savePath)) {
      const data = fs.readFileSync(savePath, 'utf-8')
      return { success: true, data: JSON.parse(data) }
    }
    return { success: true, data: [] }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
})

ipcMain.handle('save-templates', async (event, data) => {
  try {
    const savePath = path.join(userDataPath, 'templates.json')
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-templates', async () => {
  try {
    const savePath = path.join(userDataPath, 'templates.json')
    if (fs.existsSync(savePath)) {
      const data = fs.readFileSync(savePath, 'utf-8')
      return { success: true, data: JSON.parse(data) }
    }
    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: error.message, data: null }
  }
})
