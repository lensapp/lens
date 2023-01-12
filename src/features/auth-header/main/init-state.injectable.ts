/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../../main/library";
import authHeaderStateInjectable from "../common/header-state.injectable";
import computeAuthHeaderValueInjectable from "./compute-value.injectable";

const initAuthHeaderStateInjectable = getInjectable({
  id: "init-auth-header-state",
  instantiate: (di) => ({
    id: "init-auth-header-state",
    run: async () => {
      const state = di.inject(authHeaderStateInjectable);
      const computeAuthHeaderValue = di.inject(computeAuthHeaderValueInjectable);

      state.set(computeAuthHeaderValue());
    },
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initAuthHeaderStateInjectable;
