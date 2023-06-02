/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rootFrameChildComponentInjectionToken } from "@k8slens/react-application";
import { computed } from "mobx";
import { Notifications } from "./notifications";

export const notificationsRootFrameChildComponentInjectable = getInjectable({
  id: "notifications-root-frame-child-component",

  instantiate: () => ({
    id: "notifications",
    shouldRender: computed(() => true),
    Component: Notifications,
  }),

  injectionToken: rootFrameChildComponentInjectionToken,
});
