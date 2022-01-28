/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { IngressStore } from "./store";

const ingressStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/networking.k8s.io/v1/ingresses") as IngressStore,
  lifecycle: lifecycleEnum.singleton,
});

export default ingressStoreInjectable;
