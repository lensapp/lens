/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import syncBoxChannelInjectable from "./sync-box-channel.injectable";
import syncBoxStateInjectable from "./sync-box-state.injectable";
import { getMessageChannelListenerInjectable } from "../channel/message-channel-listener-injection-token";

const syncBoxChannelListenerInjectable = getMessageChannelListenerInjectable(syncBoxChannelInjectable, (di) => {
  return ({ id, value }) => {
    const syncBoxState = di.inject(syncBoxStateInjectable, id);

    syncBoxState.set(value);
  };
});

export default syncBoxChannelListenerInjectable;
