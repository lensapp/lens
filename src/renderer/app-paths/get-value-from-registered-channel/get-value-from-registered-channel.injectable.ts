/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer/ipc-renderer.injectable";
import { getValueFromRegisteredChannel } from "./get-value-from-registered-channel";
import type { Channel } from "../../../common/ipc-channel/channel";

export type GetValueFromRegisteredChannel = <TChannel extends Channel<TInstance>, TInstance>(channel: TChannel) => Promise<TChannel["_template"]>;

const getValueFromRegisteredChannelInjectable = getInjectable({
  id: "get-value-from-registered-channel",

  instantiate: (di) => getValueFromRegisteredChannel({
    ipcRenderer: di.inject(ipcRendererInjectable),
  }),
});

export default getValueFromRegisteredChannelInjectable;
