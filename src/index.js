import { app, BrowserWindow, dialog, screen } from "electron";
import path from 'path';
import FolderSelectionService from "./Services/FolderSelectionService.js";
import FrameActionService from "./Services/FrameActionService.js";
import DefaultFileAssociationService from "./Services/DefaultFileAssociationService.js";
import SupportedFileTypeData from "./Data/SupportedFileTypeData.js";
import UtilityService from "./Services/UtilityService.js";

let isNotDeeplinkOpened = true;
let isNotArgVidOpened = true;
let mainWindow;

const getVideoFile = (argv) => {
  const supported = SupportedFileTypeData.supportedExtension;
  return argv.find(arg =>
    supported.some(ext => arg.toLowerCase().endsWith(ext))
  );
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    frame: false,
    icon: path.join(app.getAppPath(), 'src', 'Assets', 'favicon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: UtilityService.isDev(),
      preload: path.join(app.getAppPath(), 'src', 'preload.js'),
      webSecurity: !UtilityService.isDev(),
      enableBlinkFeatures: 'AudioVideoTracks'
    }
  });

  mainWindow.maximize();
  if (UtilityService.isDev()) mainWindow.loadURL('http://10.33.110.78:5500/src/UI/index.html');
  else {
    const uiPath = path.join(app.getAppPath(), 'src', 'UI', 'index.html')
    mainWindow.loadFile(uiPath);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1 / screen.getPrimaryDisplay().scaleFactor);
    mainWindow.show();

    if (isNotArgVidOpened) {
      isNotArgVidOpened = false
      const file = getVideoFile(process.argv);
      if (file) FolderSelectionService.openFile(file, mainWindow);
    }

    if (isNotDeeplinkOpened) {
      isNotDeeplinkOpened = false;
      const url = process.argv.find(arg => arg.startsWith('noobplayer://'));
      if (url) DefaultFileAssociationService.handleDeepLink(url, mainWindow);
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isReload = (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'r';
    if (isReload) event.preventDefault();
  });

  screen.on('display-metrics-changed', (event, display, changedMetrics) => {
    mainWindow.webContents.setZoomFactor(1 / display.scaleFactor);
  });
}

app.whenReady().then(async () => {
  createMainWindow();
  FolderSelectionService.init(mainWindow);
  FrameActionService.init(mainWindow);
  DefaultFileAssociationService.init();
});