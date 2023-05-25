/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { IngressClassApi } from "@k8slens/kube-api";
import { kubeApiInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

const ingressClassApiInjectable = getInjectable({
  id: "ingress-class-api",
  instantiate: (di) => new IngressClassApi({
    logger: di.inject(loggerInjectionToken),
    maybeKubeApi: di.inject(maybeKubeApiInjectable),
  }),

  injectionToken: kubeApiInjectionToken,
});

export default ingressClassApiInjectable;
