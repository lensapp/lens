/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { CommandContainer } from "./command-container";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";

const commandContainerClusterFrameChildComponentInjectable = getInjectable({
  id: "command-container-cluster-frame-child-component",
  instantiate: () => ({
    id: "command-container",
    shouldRender: computed(() => true),
    Component: CommandContainer,
  }),
  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default commandContainerClusterFrameChildComponentInjectable;
