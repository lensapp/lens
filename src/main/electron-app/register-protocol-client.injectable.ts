/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import electronAppInjectable from "./electron-app.injectable";

const registerProtocolClientInjectable = getInjectable({
  id: "register-protocol-client",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const app = di.inject(electronAppInjectable);

    return (protocol: string) => {
      logger.info(`📟 Setting protocol client for ${protocol}://`);

      if (app.setAsDefaultProtocolClient(protocol)) {
        logger.info("📟 Protocol client register succeeded ✅");
      } else {
        logger.info("📟 Protocol client register failed ❗");
      }
    };
  },
});

export default registerProtocolClientInjectable;
