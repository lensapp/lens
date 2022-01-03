/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { BrowserWindow, webContents } from "electron";
import { broadcastMessage } from "../../common/ipc";

type WindowAction = "goBack" | "goForward" | "minimize" | "toggleMaximize" | "close";

export function windowAction(action: WindowAction) {
  const window = BrowserWindow.getFocusedWindow();

  if (!window) return;

  switch (action) {
    case "goBack": {
      window.webContents.goBack();
      break;
    }

    case "goForward": {
      window.webContents.goForward();
      break;
    }

    case "minimize": {
      window.minimize();
      break;
    }

    case "toggleMaximize": {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      break;
    }

    case "close": {
      window.close();
      break;
    }
  }

  if (action === "goBack") {
    window.webContents.goBack();
  } else if (action === "goForward") {
    window.webContents.goForward();
  } else if (action === "toggleMaximize") {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
}

export function onLocationChange() {
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
