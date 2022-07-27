/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { StorageClassApi } from "./storage-class.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const storageClassApiInjectable = getInjectable({
  id: "storage-class-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "storageClassApi is only available in certain environments");

    return new StorageClassApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default storageClassApiInjectable;
