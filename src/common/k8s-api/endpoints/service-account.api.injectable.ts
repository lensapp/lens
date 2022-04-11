/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ServiceAccountApi } from "./service-account.api";

const serviceAccountApiInjectable = getInjectable({
  id: "service-account-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "serviceAccountApi is only available in certain environments");

    return new ServiceAccountApi();
  },
});

export default serviceAccountApiInjectable;
