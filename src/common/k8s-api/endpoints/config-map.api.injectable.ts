/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ConfigMapApi } from "./config-map.api";

const configMapApiInjectable = getInjectable({
  id: "config-map-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "configMapApi is only available in certain environments");

    return new ConfigMapApi();
  },
});

export default configMapApiInjectable;
