import { ipcMain } from "electron"

const init = (win) => {
  ipcMain.handle('APP-MAXIMIZE', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.handle('APP-MINIMIZE', () => { win.minimize(); });
  ipcMain.handle('APP-CLOSE', () => { win.close(); });
}

const FrameActionService = { init };
export default FrameActionService;