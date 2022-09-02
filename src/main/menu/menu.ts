/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Menu } from "electron";
import { appName, isWindows, productName } from "../../common/vars";
import packageJson from "../../../package.json";
import type { MenuItemOpts } from "./application-menu-items.injectable";
import type { ShowMessagePopup } from "../electron-app/features/show-message-popup.injectable";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

interface Dependencies {
  appVersion: string;
  extensionApiVersion: string;
  showMessagePopup: ShowMessagePopup;
}

export const showAbout = ({ showMessagePopup, extensionApiVersion, appVersion }: Dependencies) => async () => {
  const appInfo = [
    `${appName}: ${appVersion}`,
    `Extension API: ${extensionApiVersion}`,
    `Electron: ${process.versions.electron}`,
    `Chrome: ${process.versions.chrome}`,
    `Node: ${process.versions.node}`,
    packageJson.copyright,
  ];

  await showMessagePopup(
    `${isWindows ? " ".repeat(2) : ""}${appName}`,
    productName,
    appInfo.join("\r\n"),
  );
};

export function buildMenu(applicationMenuItems: MenuItemOpts[]) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(applicationMenuItems),
  );
}
