/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { PersistentVolumeClaimApi } from "./persistent-volume-claim.api";

const persistentVolumeClaimApiInjectable = getInjectable({
  id: "persistent-volume-claim-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "persistentVolumeClaimApi is only available in certain environments");

    return new PersistentVolumeClaimApi();
  },
});

export default persistentVolumeClaimApiInjectable;
