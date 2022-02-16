/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { app, BrowserWindow, dialog, Menu } from "electron";
import { autorun } from "mobx";
import { appName, isWindows, productName } from "../../common/vars";
import packageJson from "../../../package.json";
import type { MenuItemsOpts } from "./get-app-menu-items.injectable";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

export function initMenu(
  getAppMenuItems: () => MenuItemsOpts[],
) {
  return autorun(() => buildMenu(getAppMenuItems), {
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

export function buildMenu(
  getAppMenuItems: () => MenuItemsOpts[],
) {
  const menuItems = getAppMenuItems();

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(menuItems),
  );
}
