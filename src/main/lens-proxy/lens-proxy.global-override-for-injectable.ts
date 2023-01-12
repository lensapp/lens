/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import lensProxyInjectable from "./lens-proxy.injectable";

export default getGlobalOverride(lensProxyInjectable, (di) => {
  const lensProxyPort = di.inject(lensProxyPortInjectable);

  return ({
    close: () => { },
    listen: async () => {
      lensProxyPort.set(12345);
    },
  });
});
