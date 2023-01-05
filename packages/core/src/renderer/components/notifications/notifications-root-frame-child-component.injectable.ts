/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rootFrameChildComponentInjectionToken } from "../../frames/root-frame/root-frame-child-component-injection-token";
import { computed } from "mobx";
import { Notifications } from "./notifications";

const notificationsRootFrameChildComponentInjectable = getInjectable({
  id: "notifications-root-frame-child-component",

  instantiate: () => ({
    id: "notifications",
    shouldRender: computed(() => true),
    Component: Notifications,
  }),

  injectionToken: rootFrameChildComponentInjectionToken,
});

export default notificationsRootFrameChildComponentInjectable;
