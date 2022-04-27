/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortNumberStateInjectable from "./lens-proxy-port-number-state.injectable";

const lensProxyPortNumberInjectable = getInjectable({
  id: "lens-proxy-port-number",

  instantiate: (di) => di.inject(lensProxyPortNumberStateInjectable).get(),
});

export default lensProxyPortNumberInjectable;
