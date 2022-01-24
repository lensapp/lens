/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow, webContents } from "electron";
import { broadcastMessage } from "../../common/ipc";
import { WindowAction } from "../../common/ipc/window";

export function handleWindowAction(action: WindowAction) {
  const window = BrowserWindow.getFocusedWindow();

  if (!window) return;

  switch (action) {
    case WindowAction.GO_BACK: {
      window.webContents.goBack();
      break;
    }

    case WindowAction.GO_FORWARD: {
      window.webContents.goForward();
      break;
    }

    case WindowAction.MINIMIZE: {
      window.minimize();
      break;
    }

    case WindowAction.TOGGLE_MAXIMIZE: {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      break;
    }

    case WindowAction.CLOSE: {
      window.close();
      break;
    }

    default:
      throw new Error(`Attemped window action ${action} is unknown`);
  }
}

export function onLocationChange(): void {
  const getAllWebContents = webContents.getAllWebContents();

  const canGoBack = getAllWebContents.some((webContent) => {
    if (webContent.getType() === "window") {
      return webContent.canGoBack();
    }

    return false;
  });

  const canGoForward = getAllWebContents.some((webContent) => {
    if (webContent.getType() === "window") {
      return webContent.canGoForward();
    }

    return false;
  });

  broadcastMessage("history:can-go-back", canGoBack);
  broadcastMessage("history:can-go-forward", canGoForward);
}
