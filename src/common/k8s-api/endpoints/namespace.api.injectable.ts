/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { NamespaceApi } from "./namespace.api";

const namespaceApiInjectable = getInjectable({
  id: "namespace-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "namespaceApi is only available in certain environments");

    return new NamespaceApi();
  },
});

export default namespaceApiInjectable;
