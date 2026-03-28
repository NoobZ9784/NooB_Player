import { dialog, ipcMain } from "electron";
import RuntimeDataManagerService from "./RuntimeDataManagerService.js";
import fs from 'fs/promises';
import path from "path";
import mime from "mime-types";
import { pathToFileURL } from "url";
import SupportedFileTypeData from "../Data/SupportedFileTypeData.js";

const openFile = async (filePath, win) => {
  const folderPath = path.dirname(filePath);
  const fileName = path.basename(filePath);

  handleFolderSelection(folderPath, win, fileName);
}

const handleFolderSelection = (folderPath, win, fileName = null) => {
  RuntimeDataManagerService.add('selected-folder', folderPath);
  fs.readdir(folderPath).then(async (files) => {
    if (files.length > 0) win.webContents.send('folderSelected', { folderPath, fileName });
    files = files.sort();
    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stats = await fs.stat(fullPath);
      const mimeType = mime.lookup(file) || "unknown";

      if (!stats.isDirectory() && SupportedFileTypeData.supportedFileTypes.includes(mimeType)) win.webContents.send('addFileIntoList', {
        name: file,
        path: pathToFileURL(fullPath).href,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        mimeType: mimeType
      });

    }
  }).catch(console.error);
}

const init = (win) => {
  ipcMain.handle('openFolder', async (event, folderPath) => {

    if (!folderPath) {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
      });
      if (!result.canceled) folderPath = result.filePaths[0];
    }

    if (folderPath) handleFolderSelection(folderPath, win);
  });

  ipcMain.handle('openFile', async (_, filePath) => {
    if (!filePath) {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{ name: 'Videos', extensions: SupportedFileTypeData.supportedExtension }]
      });
      if (!result.canceled) filePath = result.filePaths[0];
    };
    await openFile(filePath, win);
  });

}



const FolderSelectionService = { init, handleFolderSelection, openFile };
export default FolderSelectionService;