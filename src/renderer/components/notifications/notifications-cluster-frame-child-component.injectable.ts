/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { Notifications } from "./notifications";
import { clusterFrameChildComponentInjectionToken } from "../../frames/cluster-frame/cluster-frame-child-component-injection-token";

const notificationsClusterFrameChildComponentInjectable = getInjectable({
  id: "notifications-cluster-frame-child-component",

  instantiate: () => ({
    id: "notifications",
    shouldRender: computed(() => true),
    Component: Notifications,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default notificationsClusterFrameChildComponentInjectable;
