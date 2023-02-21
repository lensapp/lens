/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import unmountRootComponentInjectable from "../../window/unmount-root-component.injectable";

const handleOnMainFrameCloseInjectable = getInjectable({
  id: "handle-on-main-frame-close",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const unmountRootComponent = di.inject(unmountRootComponentInjectable);

    return () => {
      window.addEventListener("beforeunload", () => {
        logger.info("[ROOT-FRAME]: Unload app");
        unmountRootComponent();
      });
    };
  },
  causesSideEffects: true,
});

export default handleOnMainFrameCloseInjectable;
