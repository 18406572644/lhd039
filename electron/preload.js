const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveDocument: (data) => ipcRenderer.invoke('save-document', data),
  loadDocuments: () => ipcRenderer.invoke('load-documents'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  exportTxt: (content, defaultName) => ipcRenderer.invoke('export-txt', content, defaultName),
  exportPdf: (htmlContent, defaultName) => ipcRenderer.invoke('export-pdf', htmlContent, defaultName),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen')
})
