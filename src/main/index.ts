// Main process

import "../common/system-ca"
import { app, BrowserWindow } from "electron"

console.log('MAIN', process.resourcesPath)

app.whenReady().then(function start() {
  console.log('APP READY')

  var window = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
    }
  });

  window.loadFile("index.html");
  window.show();
});
