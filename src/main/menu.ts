import { app, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, webContents } from "electron"
import { autorun } from "mobx";
import { WindowManager } from "./window-manager";
import { appName, isMac, isWindows } from "../common/vars";
import { addClusterURL } from "../renderer/components/+add-cluster/add-cluster.route";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { whatsNewURL } from "../renderer/components/+whats-new/whats-new.route";
import { clusterSettingsURL } from "../renderer/components/+cluster-settings/cluster-settings.route";
import { menuRegistry } from "../extensions/registries/menu-registry";
import logger from "./logger";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help"

export function initMenu(windowManager: WindowManager) {
  return autorun(() => buildMenu(windowManager), {
    delay: 100
  });
}

export function showAbout(browserWindow: BrowserWindow) {
  const appInfo = [
    `${appName}: ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Chrome: ${process.versions.chrome}`,
    `Copyright 2020 Mirantis, Inc.`,
  ]
  dialog.showMessageBoxSync(browserWindow, {
    title: `${isWindows ? " ".repeat(2) : ""}${appName}`,
    type: "info",
    buttons: ["Close"],
    message: `Lens`,
    detail: appInfo.join("\r\n")
  })
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

  async function navigate(url: string) {
    logger.info(`[MENU]: navigating to ${url}`);
    await windowManager.navigate(url);
  }

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
        accelerator: 'CmdOrCtrl+,',
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
      {
        label: 'Quit',
        accelerator: 'Cmd+Q',
        click() {
          app.exit(); // force quit since might be blocked within app.on("will-quit")
        }
      }
    ]
  };

  const fileMenu: MenuItemConstructorOptions = {
    label: "File",
    submenu: [
      {
        label: 'Add Cluster',
        accelerator: 'CmdOrCtrl+Shift+A',
        click() {
          navigate(addClusterURL())
        }
      },
      ...activeClusterOnly([
        {
          label: 'Cluster Settings',
          accelerator: 'CmdOrCtrl+Shift+S',
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
          accelerator: 'Ctrl+,',
          click() {
            navigate(preferencesURL())
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]),
      { type: 'separator' },
      { role: 'close' } // close current window
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
          webContents.getFocusedWebContents()?.goForward()
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          windowManager.reload();
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

  // Prepare menu items order
  const appMenu: Record<MenuTopId, MenuItemConstructorOptions> = {
    mac: macAppMenu,
    file: fileMenu,
    edit: editMenu,
    view: viewMenu,
    help: helpMenu,
  }

  // Modify menu from extensions-api
  menuRegistry.getItems().forEach(({ parentId, ...menuItem }) => {
    try {
      const topMenu = appMenu[parentId as MenuTopId].submenu as MenuItemConstructorOptions[];
      topMenu.push(menuItem);
    } catch (err) {
      logger.error(`[MENU]: can't register menu item, parentId=${parentId}`, { menuItem })
    }
  })

  if (!isMac) {
    delete appMenu.mac
  }

  const menu = Menu.buildFromTemplate(Object.values(appMenu));
  Menu.setApplicationMenu(menu);
}
