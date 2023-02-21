/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import unmountRootComponentInjectable from "../../window/unmount-root-component.injectable";

const initRootFrameInjectable = getInjectable({
  id: "init-root-frame",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const unmountRootComponent = di.inject(unmountRootComponentInjectable);

    return async () => {
      window.addEventListener("beforeunload", () => {
        logger.info("[ROOT-FRAME]: Unload app");
        unmountRootComponent();
      });
    };
  },
});

export default initRootFrameInjectable;
