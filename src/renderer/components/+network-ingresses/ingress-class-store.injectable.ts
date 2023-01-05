/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { getInjectable } from "@ogre-tools/injectable";
import {
  kubeObjectStoreInjectionToken,
} from "../../../common/k8s-api/api-manager/manager.injectable";
import ingressClassApiInjectable
  from "../../../common/k8s-api/endpoints/ingress-class.api.injectable";
import { IngressClassStore } from "./ingress-class-store";
import clusterFrameContextForNamespacedResourcesInjectable
  from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";

const ingressClassStoreInjectable = getInjectable({
  id: "ingress-class-store",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "ingressClassStore is only available in certain environments");

    const api = di.inject(ingressClassApiInjectable);

    return new IngressClassStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    }, api);
  },

  injectionToken: kubeObjectStoreInjectionToken,
});

export default ingressClassStoreInjectable;
