/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "./api-manager.injectable";

const lookupApiLinkInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).lookupApiLink,
  lifecycle: lifecycleEnum.singleton,
});

export default lookupApiLinkInjectable;
