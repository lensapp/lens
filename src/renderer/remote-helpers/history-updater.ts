/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { webContents } from "@electron/remote";
import { reaction } from "mobx";
import { broadcastMessage } from "../../common/ipc";
import { navigation } from "../navigation";

export function watchHistoryState() {
  return reaction(() => navigation.location, () => {
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
  });
}
