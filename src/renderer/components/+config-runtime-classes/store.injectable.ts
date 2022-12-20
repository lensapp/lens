/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import runtimeClassApiInjectable from "../../../common/k8s-api/endpoints/runtime-class.api.injectable";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { RuntimeClassStore } from "./store";

const runtimeClassStoreInjectable = getInjectable({
  id: "runtime-class-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "runtimeClassStore is only available in certain environments");

    const api = di.inject(runtimeClassApiInjectable);

    return new RuntimeClassStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default runtimeClassStoreInjectable;
