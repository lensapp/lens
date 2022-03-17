/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { BrowserWindow } from "electron";
import { app, dialog, Menu } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import { appName, isWindows, productName } from "../../common/vars";
import packageJson from "../../../package.json";
import type { MenuItemOpts } from "./application-menu-items.injectable";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

export function initMenu(
  applicationMenuItems: IComputedValue<MenuItemOpts[]>,
) {
  return autorun(() => buildMenu(applicationMenuItems.get()), {
    delay: 100,
  });
}

export function showAbout(browserWindow: BrowserWindow) {
  const appInfo = [
    `${appName}: ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Chrome: ${process.versions.chrome}`,
    `Node: ${process.versions.node}`,
    packageJson.copyright,
  ];

  dialog.showMessageBoxSync(browserWindow, {
    title: `${isWindows ? " ".repeat(2) : ""}${appName}`,
    type: "info",
    buttons: ["Close"],
    message: productName,
    detail: appInfo.join("\r\n"),
  });
}

export function buildMenu(applicationMenuItems: MenuItemOpts[]) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(applicationMenuItems),
  );
}
