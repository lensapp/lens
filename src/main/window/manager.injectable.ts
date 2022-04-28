/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";
import windowManagerLoggerInjectable from "./logger.injectable";
import { WindowManager } from "./manager";

const windowManagerInjectable = getInjectable({
  id: "window-manager",
  instantiate: (di) => new WindowManager({
    logger: di.inject(windowManagerLoggerInjectable),
    proxyPort: di.inject(lensProxyPortInjectable),
  }),
});

export default windowManagerInjectable;
