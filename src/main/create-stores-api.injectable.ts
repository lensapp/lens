/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../common/k8s-api/create-stores-apis.token";

const createStoresAndApisInjectable = getInjectable({
  id: "create-stores-and-apis",
  instantiate: () => false,
  injectionToken: createStoresAndApisInjectionToken,
});

export default createStoresAndApisInjectable;
