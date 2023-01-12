/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsFirstInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import authHeaderStateInjectable from "../common/header-state.injectable";
import requestAuthHeaderValueInjectable from "./request-header.injectable";

const initAuthHeaderStateInjectable = getInjectable({
  id: "init-auth-header-state",
  instantiate: (di) => ({
    id: "init-auth-header-state",
    run: async () => {
      const state = di.inject(authHeaderStateInjectable);
      const requestAuthHeaderValue = di.inject(requestAuthHeaderValueInjectable);

      state.set(await requestAuthHeaderValue());
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default initAuthHeaderStateInjectable;
