/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { IpcMainWindowEvents } from "../../common/ipc";
import { navigation } from "../navigation";

export function watchHistoryState() {
  return reaction(() => navigation.location, (location) => {
    ipcRenderer.send(IpcMainWindowEvents.LOCATION_CHANGED, location);
  });
}
