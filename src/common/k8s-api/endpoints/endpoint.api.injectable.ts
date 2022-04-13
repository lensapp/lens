/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { EndpointsApi } from "./endpoint.api";

const endpointsApiInjectable = getInjectable({
  id: "endpoints-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "endpointsApi is only available in certain environments");

    return new EndpointsApi();
  },
});

export default endpointsApiInjectable;
