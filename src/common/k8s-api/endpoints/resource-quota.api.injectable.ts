/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ResourceQuotaApi } from "./resource-quota.api";

const resourceQuotaApiInjectable = getInjectable({
  id: "resource-quota-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "resourceQuotaApi is only available in certain environments");

    return new ResourceQuotaApi();
  },
});

export default resourceQuotaApiInjectable;
