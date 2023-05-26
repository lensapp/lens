/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiKubeInjectionToken } from "@k8slens/kube-api";

export const maybeKubeApiInjectable = getInjectable({
  id: "maybe-kube-api",
  instantiate: (di) => {
    try {
      return di.inject(apiKubeInjectionToken);
    } catch {
      return undefined;
    }
  },
});
