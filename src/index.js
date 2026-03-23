import { app, BrowserWindow, screen } from "electron";
import path from 'path';
import FolderSelectionService from "./Services/FolderSelectionService.js";
import FrameActionService from "./Services/FrameActionService.js";
import DefaultFileAssociationService from "./Services/DefaultFileAssociationService.js";

let isNotDeeplinkOpened = true;


const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    frame: false,
    icon: path.join(app.getAppPath(), 'src', 'Assets', 'favicon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      preload: path.join(app.getAppPath(), 'src', 'preload.js'),
      // webSecurity: false
    }
  });

  mainWindow.maximize();
  const uiPath = path.join(app.getAppPath(), 'src', 'UI', 'index.html')
  mainWindow.loadFile(uiPath);

  // mainWindow.loadURL('http://192.168.1.85:5500/src/UI/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1 / screen.getPrimaryDisplay().scaleFactor);
    mainWindow.show();
    if (isNotDeeplinkOpened) {
      isNotDeeplinkOpened = false;
      const url = process.argv.find(arg => arg.startsWith('noobplayer://'));
      if (url) DefaultFileAssociationService.handleDeepLink(url, mainWindow);
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isReload = (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'r';

    if (isReload) {
      event.preventDefault(); // Stop the reload from happening
    }
  });

  screen.on('display-metrics-changed', (event, display, changedMetrics) => {
    mainWindow.webContents.setZoomFactor(1 / display.scaleFactor);
  });

  FolderSelectionService.init(mainWindow);
  FrameActionService.init(mainWindow);
  DefaultFileAssociationService.init();
}

app.on('ready', () => {
  createMainWindow();
})