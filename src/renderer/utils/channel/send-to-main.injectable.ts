/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";

const sendToMainInjectable = getInjectable({
  id: "send-to-main",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channelId: string, message: any) => {
      ipcRenderer.send(channelId, message);
    };
  },
});

export default sendToMainInjectable;
