/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const lensProxyPortInjectable = getInjectable({
  id: "lens-proxy-port",
  instantiate: () => observable.box<number | undefined>(),
});

export default lensProxyPortInjectable;
