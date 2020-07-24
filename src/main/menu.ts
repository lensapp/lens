import type { WindowManager } from "./window-manager";
import { app, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, shell, webContents } from "electron"
import { autorun } from "mobx";
import { broadcastIpc } from "../common/ipc";
import { appName, isMac, issuesTrackerUrl, isWindows, slackUrl } from "../common/vars";
import { clusterStore } from "../common/cluster-store";
import { addClusterURL } from "../renderer/components/+add-cluster/add-cluster.route";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { whatsNewURL } from "../renderer/components/+whats-new/whats-new.route";
import { clusterSettingsURL } from "../renderer/components/+cluster-settings/cluster-settings.route";
import logger from "./logger";

export function initMenu(windowManager: WindowManager) {
  autorun(() => {
    logger.debug(`[MENU]: refreshing menu, cluster=${clusterStore.activeClusterId}`);
    buildMenu(windowManager);
  });
}

function buildMenu(windowManager: WindowManager) {
  const hasClusters = clusterStore.hasClusters();
  const activeClusterId = clusterStore.activeClusterId;
  const clusterView = windowManager.getClusterView(activeClusterId);

  function navigate(url: string) {
    broadcastIpc({
      channel: "menu:navigate",
      webContentId: clusterView ? clusterView.id : undefined /*no-clusters*/,
      args: [url],
    });
  }

  function macOnly(menuItems: MenuItemConstructorOptions[]): MenuItemConstructorOptions[] {
    if (!isMac) return [];
    return menuItems;
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
      ...(hasClusters ? [{
        label: 'Cluster Settings',
        click() {
          navigate(clusterSettingsURL())
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
          webContents.getFocusedWebContents().executeJavaScript('window.history.back()')
        }
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+]',
        click() {
          webContents.getFocusedWebContents().executeJavaScript('window.history.forward()')
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          webContents.getFocusedWebContents().reload()
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
