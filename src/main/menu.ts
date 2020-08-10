import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, shell, webContents } from "electron"
import { autorun, observable } from "mobx";
import { broadcastIpc } from "../common/ipc";
import { appName, isMac, issuesTrackerUrl, isWindows, slackUrl } from "../common/vars";
import { ClusterId, clusterStore } from "../common/cluster-store";
import { addClusterURL } from "../renderer/components/+add-cluster/add-cluster.route";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { whatsNewURL } from "../renderer/components/+whats-new/whats-new.route";
import { clusterSettingsURL } from "../renderer/components/+cluster-settings/cluster-settings.route";
import logger from "./logger";

const activeClusterView = observable.box<ClusterId>();

export function initMenu() {
  autorun(buildMenu);
  ipcMain.on("menu:refresh", (evt, activeClusterId: ClusterId) => {
    activeClusterView.set(activeClusterId);
  });
}

export function buildMenu() {
  function macOnly(menuItems: MenuItemConstructorOptions[]): MenuItemConstructorOptions[] {
    if (!isMac) return [];
    return menuItems;
  }

  function navigate(url: string, toClusterView = false) {
    logger.info(`[MENU]: navigating to ${url}`);
    const clusterId = activeClusterView.get();
    broadcastIpc({
      channel: "menu:navigate" + (toClusterView ? `:${clusterId}` : ""),
      args: [url],
    })
  }

  const fileMenu: MenuItemConstructorOptions = {
    label: isMac ? app.getName() : "File",
    submenu: [
      {
        label: 'Add Cluster',
        click() {
          navigate(addClusterURL())
        }
      },
      ...(activeClusterView.get() ? [{
        label: 'Cluster Settings',
        click() {
          navigate(clusterSettingsURL(), true)
        }
      }] : []),
      { type: 'separator' },
      {
        label: 'Preferences',
        click() {
          navigate(preferencesURL())
        }
      },
      ...macOnly([
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
      ]),
      { type: 'separator' },
      { role: 'quit' }
    ]
  };

  const editMenu: MenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' },
    ]
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Back',
        accelerator: 'CmdOrCtrl+[',
        click() {
          webContents.getFocusedWebContents()?.goBack();
        }
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+]',
        click() {
          webContents.getFocusedWebContents()?.goForward();
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          webContents.getFocusedWebContents()?.reload();
        }
      },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  };

  const helpMenu: MenuItemConstructorOptions = {
    role: 'help',
    submenu: [
      {
        label: "What's new?",
        click() {
          navigate(whatsNewURL())
        },
      },
      {
        label: "License",
        click: async () => {
          shell.openExternal('https://lakendlabs.com/licenses/lens-eula.md');
        },
      },
      {
        label: "Community Slack",
        click: async () => {
          shell.openExternal(slackUrl);
        },
      },
      {
        label: 'Report an Issue',
        click: async () => {
          shell.openExternal(issuesTrackerUrl);
        },
      },
      {
        label: "About Lens",
        click(menuItem: MenuItem, browserWindow: BrowserWindow) {
          const appInfo = [
            `${appName}: ${app.getVersion()}`,
            `Electron: ${process.versions.electron}`,
            `Chrome: ${process.versions.chrome}`,
            `Copyright 2020 Lakend Labs, Inc.`,
          ]
          dialog.showMessageBoxSync(browserWindow, {
            title: `${isWindows ? " ".repeat(2) : ""}${appName}`,
            type: "info",
            buttons: ["Close"],
            message: `Lens`,
            detail: appInfo.join("\r\n")
          })
        }
      }
    ]
  };

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    fileMenu, editMenu, viewMenu, helpMenu
  ]));
}
