import { app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import FolderSelectionService from './FolderSelectionService.js';

const DefaultFileAssociationService = {
  init: () => {
    if (process.defaultApp) { // DEV Important
      app.setAsDefaultProtocolClient('noobplayer', process.execPath, [
        path.resolve(process.argv[1])
      ]);
    } else {
      app.setAsDefaultProtocolClient('noobplayer');
    }
  },
  handleDeepLink: (url, win) => {
    const filePathUrl = url.split('noobplayer://')[1];
    const filePath = decodeURIComponent(filePathUrl);
    if (fs.existsSync(filePath)) FolderSelectionService.openFile(filePath, win);
    else dialog.showMessageBoxSync({ message: "File does not exist.", title: 'Alert' });
  }
}

export default DefaultFileAssociationService;