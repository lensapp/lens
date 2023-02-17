/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import handleOnClusterFrameCloseInjectable from "./on-cluster-frame-close.injectable";

const addCloseFrameHandlingInjectable = getInjectable({
  id: "add-close-frame-handling",
  instantiate: (di) => ({
    id: "add-close-frame-handling",
    run: () => {
      const handleOnClusterFrameClose = di.inject(handleOnClusterFrameCloseInjectable);

      handleOnClusterFrameClose();
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default addCloseFrameHandlingInjectable;
