/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { BrowserWindow } from "electron";
import type { Logger } from "../../common/logger";
import loggerInjectable from "../../common/logger.injectable";
import appVersionInjectable from "../../common/vars/app-version.injectable";
import chromeVersionInjectable from "../../common/vars/chrome-version.injectable";
import copyrightDeclarationInjectable from "../../common/vars/copyright-declaration.injectable";
import electronVersionInjectable from "../../common/vars/electron-version.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import nodeVersionInjectable from "../../common/vars/node-version.injectable";
import type { ShowMessageBox } from "../electron/show-message-box.injectable";
import showMessageBoxInjectable from "../electron/show-message-box.injectable";
import type { WriteTextToClipboard } from "../electron/write-text-to-clipboard.injectable";
import writeTextToClipboardInjectable from "../electron/write-text-to-clipboard.injectable";
import appNameInjectable from "../vars/app-name.injectable";

export type ShowAbout = (browserWindow: BrowserWindow) => void;

interface Dependencies {
  showMessageBox: ShowMessageBox;
  writeTextToClipboard: WriteTextToClipboard;
  appName: string;
  appVersion: string;
  copyrightDeclaration: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  isWindows: boolean;
  logger: Logger;
}

const showAboutFactory = ({
  showMessageBox,
  writeTextToClipboard,
  appName,
  appVersion,
  copyrightDeclaration,
  electronVersion,
  chromeVersion,
  nodeVersion,
  isWindows,
  logger,
}: Dependencies): ShowAbout => (
  function showAbout(browserWindow) {
    const appInfo = [
      `${appName}: ${appVersion}`,
      `Electron: ${electronVersion}`,
      `Chrome: ${chromeVersion}`,
      `Node: ${nodeVersion}`,
      copyrightDeclaration,
    ].join("\n");

    showMessageBox(browserWindow, {
      title: `${isWindows ? " ".repeat(2) : ""}${appName}`,
      type: "info",
      buttons: ["Close", "Copy"],
      message: appName,
      detail: appInfo,
      cancelId: 0,
      defaultId: 0,
    })
      .then(({ response }) => {
        /**
         * response is the index into the `buttons` array provided to `dialog.showMessageBox`
         */
        if (response === 0) {
          writeTextToClipboard(appInfo);
        }
      })
      .catch(error => logger.error("[SHOW-ABOUT]: failed to show about message", error));
  }
);

const showAboutInjectable = getInjectable({
  id: "show-about",
  instantiate: (di) => showAboutFactory({
    showMessageBox: di.inject(showMessageBoxInjectable),
    writeTextToClipboard: di.inject(writeTextToClipboardInjectable),
    appName: di.inject(appNameInjectable),
    appVersion: di.inject(appVersionInjectable),
    copyrightDeclaration: di.inject(copyrightDeclarationInjectable),
    chromeVersion: di.inject(chromeVersionInjectable),
    electronVersion: di.inject(electronVersionInjectable),
    isWindows: di.inject(isWindowsInjectable),
    logger: di.inject(loggerInjectable),
    nodeVersion: di.inject(nodeVersionInjectable),
  }),
});

export default showAboutInjectable;
