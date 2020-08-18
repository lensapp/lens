import { app, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, shell, webContents } from "electron"
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
  function ignoreOnMac(menuItems: MenuItemConstructorOptions[]) {
    if (isMac) return [];
    return menuItems;
  }

  function activeClusterOnly(menuItems: MenuItemConstructorOptions[]) {
    if (!windowManager.activeClusterId) {
      menuItems.forEach(item => {
        item.enabled = false
      });
    }
    return menuItems;
  }

  function navigate(url: string) {
    logger.info(`[MENU]: navigating to ${url}`);
    windowManager.navigate({
      channel: "menu:navigate",
      url: url,
    })
  }

  function showAbout(browserWindow: BrowserWindow) {
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

  const mt: MenuItemConstructorOptions[] = [];

  const macAppMenu: MenuItemConstructorOptions = {
    label: app.getName(),
    submenu: [
      {
        label: "About Lens",
        click(menuItem: MenuItem, browserWindow: BrowserWindow) {
          showAbout(browserWindow)
        }
      },
      { type: 'separator' },
      {
        label: 'Preferences',
        click() {
          navigate(preferencesURL())
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  };

  if (isMac) {
    mt.push(macAppMenu);
  }

  const fileMenu: MenuItemConstructorOptions = {
    label: "File",
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
            navigate(clusterSettingsURL({
              params: {
                clusterId: windowManager.activeClusterId
              }
            }))
          }
        }
      ]),
      ...ignoreOnMac([
        { type: 'separator' },
        {
          label: 'Preferences',
          click() {
            navigate(preferencesURL())
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ])
    ]
  };
  mt.push(fileMenu)

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
  mt.push(editMenu)
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
  mt.push(viewMenu)

  const helpMenu: MenuItemConstructorOptions = {
    role: 'help',
    submenu: [
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
        label: "What's new?",
        click() {
          navigate(whatsNewURL())
        },
      },
      ...ignoreOnMac([
        {
          label: "About Lens",
          click(menuItem: MenuItem, browserWindow: BrowserWindow) {
            showAbout(browserWindow)
          }
        }
      ])
    ]
  };

  mt.push(helpMenu)

  Menu.setApplicationMenu(Menu.buildFromTemplate(mt));
}
