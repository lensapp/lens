/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import ipcMainInjectable from "./ipc-main/ipc-main.injectable";
import { registerChannel } from "./register-channel";

const registerChannelInjectable = getInjectable({
  instantiate: (di) => registerChannel({
    ipcMain: di.inject(ipcMainInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default registerChannelInjectable;
