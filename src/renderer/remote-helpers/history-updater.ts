/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { reaction } from "mobx";
import { IpcMainWindowEvents, requestMain } from "../../common/ipc";
import { navigation } from "../navigation";

export function watchHistoryState() {
  return reaction(() => navigation.location, (location) => {
    requestMain(IpcMainWindowEvents.LOCATION_CHANGED, location);
  });
}
