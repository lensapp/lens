/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ServiceApi } from "./service.api";

const serviceApiInjectable = getInjectable({
  id: "service-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "serviceApi is only available in certain environments");

    return new ServiceApi();
  },
});

export default serviceApiInjectable;
