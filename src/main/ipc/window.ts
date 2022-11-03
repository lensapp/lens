/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow } from "electron";
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
