// Main process

import "../common/system-ca"
import { app, BrowserWindow } from "electron"

console.log('MAIN', process.resourcesPath)
console.log('userData', app.getPath("userData"))

app.whenReady().then(async function start() {
  var mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
    }
  });

  await mainWindow.loadFile("dist/index.html");
  mainWindow.show();
  mainWindow.focus();
});
