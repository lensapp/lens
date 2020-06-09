import { BrowserWindow, shell, Menu } from "electron"
import { PromiseIpc } from "electron-promise-ipc"
import * as windowStateKeeper from "electron-window-state"
import * as path from "path"
import { tracker } from "./tracker";

declare const __static: string;

export class WindowManager {
  public mainWindow: BrowserWindow = null;
  public splashWindow: BrowserWindow = null;
  protected promiseIpc: any
  protected windowState: windowStateKeeper.State;

  constructor(showSplash = true) {
    this.promiseIpc = new PromiseIpc({ timeout: 2000 })
    // Manage main window size&position with persistence
    this.windowState = windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });

    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 300,
      backgroundColor: "#1e2124",
      center: true,
      frame: false,
      resizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    })
    if (showSplash) {
      this.splashWindow.loadFile(path.join(__static, "/splash.html"))
      this.splashWindow.show()
    }

    this.mainWindow = new BrowserWindow({
      x: this.windowState.x,
      y: this.windowState.y,
      width: this.windowState.width,
      height: this.windowState.height,
      backgroundColor: "#1e2124",
      titleBarStyle: "hidden",
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      },
      show: false
    });

    // Hook window state manager into window lifecycle
    this.windowState.manage(this.mainWindow);

    // handle close event
    this.mainWindow.on("close", () => {
      this.mainWindow = null;
    })

    // handle external links
    this.mainWindow.webContents.on("will-navigate", (event, link) => {
      if (link.startsWith("http://localhost")) {
        return;
      }
      event.preventDefault();
      shell.openExternal(link);
    })

    // handle developer console
    if (process.env.NODE_ENV !== "production") {
      this.mainWindow.webContents.on("devtools-opened", () => {
        if (this.mainWindow.getBrowserView()) {
          this.mainWindow.getBrowserView().webContents.openDevTools({mode: "detach"})
        }
      })
    }

    this.mainWindow.on("focus", () => {
      tracker.event("app", "focus")
    })
  }

  public showMain(url: string) {
    this.mainWindow.loadURL( url ).then(() => {
      this.splashWindow.hide()
      this.splashWindow.loadURL("data:text/html;charset=utf-8,").then(() => {
        this.splashWindow.close()
        this.mainWindow.show()
      })
    })
  }
}
