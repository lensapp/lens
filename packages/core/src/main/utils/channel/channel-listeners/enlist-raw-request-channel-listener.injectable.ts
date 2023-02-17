/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../../../common/utils";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import type { RawRequestChannelListener } from "./listener-tokens";
import ipcMainInjectionToken from "../../../../common/ipc/ipc-main-injection-token";

export type EnlistRawRequestChannelListener = <TChannel extends RequestChannel<unknown, unknown>>(listener: RawRequestChannelListener<TChannel>) => Disposer;

const enlistRawRequestChannelListenerInjectable = getInjectable({
  id: "enlist-raw-request-channel-listener-for-main",

  instantiate: (di): EnlistRawRequestChannelListener => {
    const ipcMain = di.inject(ipcMainInjectionToken);

    return ({ channel, handler }) => {
      ipcMain.handle(channel.id, handler);

      return () => {
        ipcMain.off(channel.id, handler);
      };
    };
  },
});

export default enlistRawRequestChannelListenerInjectable;
