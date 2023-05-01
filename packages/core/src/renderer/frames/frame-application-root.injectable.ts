/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reactApplicationChildrenInjectionToken } from "@k8slens/react-application";
import { computed } from "mobx";
import { RootFrame } from "./root-frame/root-frame";
import { ClusterFrame } from "./cluster-frame/cluster-frame";

const frameApplicationRootInjectable = getInjectable({
  id: "frame-application-root",

  instantiate: () => ({
    id: "frame-application-root",
    Component: (
      process.isMainFrame
        ? RootFrame
        : ClusterFrame
    ),
    enabled: computed(() => true),
  }),

  causesSideEffects: true,

  injectionToken: reactApplicationChildrenInjectionToken,
});

export default frameApplicationRootInjectable;
