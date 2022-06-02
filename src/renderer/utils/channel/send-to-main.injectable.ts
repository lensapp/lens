/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonValue } from "type-fest";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import { tentativeStringifyJson } from "../../../common/utils/tentative-stringify-json";

const sendToMainInjectable = getInjectable({
  id: "send-to-main",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    // TODO: Figure out way to improve typing in internals
    return <T>(channelId: string, message: JsonValue extends T ? T : never ) => {
      const stringifiedMessage = tentativeStringifyJson(message);

      ipcRenderer.send(channelId, ...(stringifiedMessage ? [stringifiedMessage] : []));
    };
  },
});

export default sendToMainInjectable;
