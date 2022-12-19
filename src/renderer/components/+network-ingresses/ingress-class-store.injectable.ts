/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import {
  kubeObjectStoreInjectionToken
} from "../../../common/k8s-api/api-manager/manager.injectable";
import ingressClassApiInjectable
  from "../../../common/k8s-api/endpoints/ingress-class.api.injectable";
import { IngressClassStore } from "./ingress-class-store";

const ingressClassStoreInjectable = getInjectable({
  id: "ingress-class-store",
  instantiate: (di) => {
    return new IngressClassStore(
      di.inject(ingressClassApiInjectable),
    );
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default ingressClassStoreInjectable;
