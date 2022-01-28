/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { IngressApi } from "./ingress.api";

const ingressApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/networking.k8s.io/v1/ingresses", "/apis/extensions/v1beta1/ingresses") as IngressApi,
  lifecycle: lifecycleEnum.singleton,
});

export default ingressApiInjectable;
