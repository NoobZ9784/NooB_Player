const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vidPlayer', {
  platform: process.platform,

  appMaximize: () => ipcRenderer.invoke('APP-MAXIMIZE'),
  appMinimize: () => ipcRenderer.invoke('APP-MINIMIZE'),
  appClose: () => ipcRenderer.invoke('APP-CLOSE'),
  openFolder: (folderPath) => ipcRenderer.invoke('openFolder', folderPath),
  openFile: (filePath) => ipcRenderer.invoke('openFile', filePath),

  folderSelected: (callback) => { ipcRenderer.on('folderSelected', (event, data) => callback(data)); },
  addFileIntoList: (callback) => { ipcRenderer.on('addFileIntoList', (event, data) => callback(data)); }

});