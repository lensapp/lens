/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ServiceAccountStore } from "./store";

const serviceAccountStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/api/v1/serviceaccounts") as ServiceAccountStore,
  lifecycle: lifecycleEnum.singleton,
});

export default serviceAccountStoreInjectable;
