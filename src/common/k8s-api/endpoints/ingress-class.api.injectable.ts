/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { IngressClassApi } from "./ingress-class.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const ingressClassApiInjectable = getInjectable({
  id: "ingress-class-api",
  instantiate: (di) => {
    return new IngressClassApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default ingressClassApiInjectable;
