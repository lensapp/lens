import {app, dialog, Menu, MenuItemConstructorOptions, shell, webContents, BrowserWindow, MenuItem} from "electron";

export interface MenuOptions {
  logoutHook: any;
  addClusterHook: any;
  clusterSettingsHook: any;
  showWhatsNewHook: any;
  showPreferencesHook: any;
  // all the above are really () => void type functions
}

function setClusterSettingsEnabled(enabled: boolean): void {
  const isMac = process.platform === 'darwin';
  const menuIndex = isMac ? 1 : 0;
  Menu.getApplicationMenu().items[menuIndex].submenu.items[1].enabled = enabled;
}

function showAbout(_menuitem: MenuItem, browserWindow: BrowserWindow): void {
  const appDetails = [
    `Version: ${app.getVersion()}`,
  ];
  appDetails.push(`Copyright 2020 Lakend Labs, Inc.`);
  let title = "Lens";
  if (process.platform === "win32") {
    title = `  ${title}`;
  }
  dialog.showMessageBoxSync(browserWindow, {
    title,
    type: "info",
    buttons: ["Close"],
    message: `Lens`,
    detail: appDetails.join("\r\n")
  });
}

/**
 * Constructs the menu based on the example at: https://electronjs.org/docs/api/menu#main-process
 * Menu items are constructed piece-by-piece to have slightly better control on individual sub-menus
 *
 * @param ipc the main promiceIpc handle. Needed to be able to hook IPC sending into logout click handler.
 */
export default function initMenu(opts: MenuOptions, promiseIpc: any): void {
  const isMac = process.platform === 'darwin';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const mt: MenuItemConstructorOptions[] = [];
  const macAppMenu: MenuItemConstructorOptions = {
    label: app.getName(),
    submenu: [
      {
        label: "About Lens",
        click: showAbout
      },
      { type: 'separator' },
      {
        label: 'Preferences',
        click: opts.showPreferencesHook,
        enabled: true
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
  if(isMac) {
    mt.push(macAppMenu);
  }

  let fileMenu: MenuItemConstructorOptions;
  if(isMac) {
    fileMenu = {
      label: 'File',
      submenu: [{
        label: 'Add Cluster...',
        click: opts.addClusterHook,
      },
      {
        label: 'Cluster Settings',
        click: opts.clusterSettingsHook,
        enabled: false
      }
      ]
    };
  } else {
    fileMenu = {
      label: 'File',
      submenu: [
        {
          label: 'Add Cluster...',
          click: opts.addClusterHook,
        },
        {
          label: 'Cluster Settings',
          click: opts.clusterSettingsHook,
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          click: opts.showPreferencesHook,
          enabled: true
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    };
  }
  mt.push(fileMenu);

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
  mt.push(editMenu);

  const viewMenuList: MenuItemConstructorOptions[] = [
    {
      label: 'Back',
      accelerator: 'CmdOrCtrl+[',
      click(): void {
        webContents.getFocusedWebContents().executeJavaScript('window.history.back()');
      }
    },
    {
      label: 'Forward',
      accelerator: 'CmdOrCtrl+]',
      click(): void {
        webContents.getFocusedWebContents().executeJavaScript('window.history.forward()');
      }
    },
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click(): void {
        webContents.getFocusedWebContents().reload();
      }
    }
  ];
  if (isDevelopment) {
    viewMenuList.push(
      { role: "toggleDevTools" },
      {
        label: 'Open Dashboard Devtools',
        click(): void {
          webContents.getFocusedWebContents().openDevTools();
        }
      }
    );
  }
  viewMenuList.push(
    { type: 'separator' },
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  );
  mt.push({
    label: 'View',
    submenu: viewMenuList,
  });

  const helpMenu: MenuItemConstructorOptions = {
    role: 'help',
    submenu: [
      {
        label: 'License',
        click(): void {
          shell.openExternal('https://lakendlabs.com/licenses/lens-eula.md');
        },
      },
      {
        label: 'Community Slack',
        click(): void {
          shell.openExternal('https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI');
        },
      },
      {
        label: 'Report an Issue',
        click(): void {
          shell.openExternal('https://github.com/lensapp/lens/issues');
        },
      },
      {
        label: "What's new?",
        click: opts.showWhatsNewHook,
      },
      ...(process.platform !== "darwin" ? [{
        label: "About Lens",
        click: showAbout
      }] : [])
    ]
  };
  mt.push(helpMenu);

  const menu = Menu.buildFromTemplate(mt);
  Menu.setApplicationMenu(menu);

  promiseIpc.on("enableClusterSettingsMenuItem", (_clusterId: string) => {
    setClusterSettingsEnabled(true);
  });

  promiseIpc.on("disableClusterSettingsMenuItem", () => {
    setClusterSettingsEnabled(false);
  });
};
