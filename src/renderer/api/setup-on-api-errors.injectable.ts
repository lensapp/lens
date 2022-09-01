/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../common/k8s-api";
import { onApiError } from "./on-api-error";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const setupOnApiErrorListenersInjectable = getInjectable({
  id: "setup-on-api-error-listeners",

  instantiate: () => ({
    id: "setup-on-api-error-listeners",
    run: () => {
      apiBase?.onError.addListener(onApiError);
    },
  }),

  injectionToken: beforeFrameStartsInjectionToken,
  causesSideEffects: true,
});

export default setupOnApiErrorListenersInjectable;
