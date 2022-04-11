/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ReplicaSetApi } from "./replica-set.api";

const replicaSetApiInjectable = getInjectable({
  id: "replica-set-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "replicaSetApi is only available in certain environments");

    return new ReplicaSetApi();
  },
});

export default replicaSetApiInjectable;
