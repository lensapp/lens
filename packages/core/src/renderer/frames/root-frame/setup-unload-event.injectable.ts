/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeMainFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import handleOnMainFrameCloseInjectable from "./on-main-frame-close.injectable";

const setupUnloadEventHandlerInjectable = getInjectable({
  id: "setup-unload-event-handler",
  instantiate: (di) => ({
    id: "setup-unload-event-handler",
    run: () => {
      const handleOnMainFrameClose = di.inject(handleOnMainFrameCloseInjectable);

      handleOnMainFrameClose();
    },
  }),
  injectionToken: beforeMainFrameStartsSecondInjectionToken,
});

export default setupUnloadEventHandlerInjectable;
