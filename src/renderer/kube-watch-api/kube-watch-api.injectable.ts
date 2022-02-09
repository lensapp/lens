/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterFrameContextInjectable from "../cluster-frame-context/cluster-frame-context.injectable";
import { KubeWatchApi } from "./kube-watch-api";

const kubeWatchApiInjectable = getInjectable({
  id: "kube-watch-api",

  instantiate: (di) => new KubeWatchApi({
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
  }),
});

export default kubeWatchApiInjectable;
