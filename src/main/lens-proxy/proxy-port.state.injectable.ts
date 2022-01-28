/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

const proxyPortStateInjectable = getInjectable({
  instantiate: () => observable.box(),
  lifecycle: lifecycleEnum.singleton,
});

export default proxyPortStateInjectable;
