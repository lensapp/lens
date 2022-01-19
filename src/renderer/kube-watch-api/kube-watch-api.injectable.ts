/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterFrameContextInjectable from "../cluster-frame-context/cluster-frame-context.injectable";
import { KubeWatchApi } from "./kube-watch-api";

const kubeWatchApiInjectable = getInjectable({
  instantiate: (di) => new KubeWatchApi({
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default kubeWatchApiInjectable;
