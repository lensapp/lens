/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../cluster-frame-context/for-namespaced-resources.injectable";
import { KubeWatchApi } from "./kube-watch-api";

const kubeWatchApiInjectable = getInjectable({
  id: "kube-watch-api",

  instantiate: (di) => new KubeWatchApi({
    clusterContext: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    logger: di.inject(loggerInjectionToken),
  }),
});

export default kubeWatchApiInjectable;
