/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ClusterApi } from "./cluster.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const clusterApiInjectable = getInjectable({
  id: "cluster-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "clusterApi is only available in certain environments");

    return new ClusterApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default clusterApiInjectable;
