/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensAuthenticationChannel } from "../../common/auth/channel";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";
import authHeaderValueStateInjectable from "./auth-header-state.injectable";

const initAuthHeaderValueStateInjectable = getInjectable({
  id: "init-auth-header-value-state",
  instantiate: (di) => {
    const state = di.inject(authHeaderValueStateInjectable);
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return {
      id: "init-auth-header-value-state",
      run: async () => {
        state.set(await requestFromChannel(lensAuthenticationChannel));
      },
    };
  },
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initAuthHeaderValueStateInjectable;
