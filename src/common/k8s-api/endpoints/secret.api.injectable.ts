/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { SecretApi } from "./secret.api";

const secretApiInjectable = getInjectable({
  id: "secret-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "secretApi is only available in certain environments");

    return new SecretApi();
  },
});

export default secretApiInjectable;
