/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";
import selectedUpdateChannelInjectable from "../../features/application-update/common/selected-update-channel/selected-update-channel.injectable";
import emitAppEventInjectable from "../app-event-bus/emit-event.injectable";

const userStoreInjectable = getInjectable({
  id: "user-store",

  instantiate: (di) => {
    UserStore.resetInstance();

    return UserStore.createInstance({
      selectedUpdateChannel: di.inject(selectedUpdateChannelInjectable),
      emitAppEvent: di.inject(emitAppEventInjectable),
    });
  },

  causesSideEffects: true,
});

export default userStoreInjectable;
