/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getProxyPortInjectable from "../lens-proxy/get-proxy-port.injectable";
import { WindowManager } from "./manager";

const windowManagerInjectable = getInjectable({
  instantiate: (di) => new WindowManager({
    proxyPort: di.inject(getProxyPortInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default windowManagerInjectable;
