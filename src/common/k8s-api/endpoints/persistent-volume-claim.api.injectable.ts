/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PersistentVolumeClaimApi } from "./persistent-volume-claim.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const persistentVolumeClaimApiInjectable = getInjectable({
  id: "persistent-volume-claim-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "persistentVolumeClaimApi is only available in certain environments");

    return new PersistentVolumeClaimApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default persistentVolumeClaimApiInjectable;
