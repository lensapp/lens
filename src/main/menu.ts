import { app, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, shell } from "electron"
import { autorun } from "mobx";
import { WindowManager } from "./window-manager";
import { appName, isMac, issuesTrackerUrl, isWindows, slackUrl } from "../common/vars";
import { addClusterURL } from "../renderer/components/+add-cluster/add-cluster.route";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { whatsNewURL } from "../renderer/components/+whats-new/whats-new.route";
import { clusterSettingsURL } from "../renderer/components/+cluster-settings/cluster-settings.route";
import logger from "./logger";

export function initMenu(windowManager: WindowManager) {
  autorun(() => buildMenu(windowManager), {
    delay: 100
  });
}

export function buildMenu(windowManager: WindowManager) {
  function macOnly(menuItems: MenuItemConstructorOptions[]) {
    if (!isMac) return [];
    return menuItems;
  }

  function activeClusterOnly(menuItems: MenuItemConstructorOptions[]) {
    if (!windowManager.activeClusterId) return [];
    return menuItems;
  }

  function navigate(url: string, toClusterView = false) {
    logger.info(`[MENU]: navigating to ${url}`);
    windowManager.navigate({
      channel: "menu:navigate",
      url: url,
      clusterId: toClusterView ? windowManager.activeClusterId : null,
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
      ...activeClusterOnly([
        {
          label: 'Cluster Settings',
          click() {
            navigate(clusterSettingsURL(), true)
          }
        }
      ]),
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
          windowManager.getActiveClusterView()?.goBack();
        }
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+]',
        click() {
          windowManager.getActiveClusterView()?.goForward();
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          windowManager.getActiveClusterView()?.reload();
        }
      },
      { role: 'toggleDevTools' },
      ...activeClusterOnly([
        {
          accelerator: "CmdOrCtrl+Shift+I",
          label: "Toggle Dashboard DevTools",
          click() {
            windowManager.getActiveClusterView()?.toggleDevTools();
          }
        }
      ]),
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
