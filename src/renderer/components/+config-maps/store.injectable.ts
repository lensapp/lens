/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ConfigMapStore } from "./store";

const configMapStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/api/v1/configmaps") as ConfigMapStore,
  lifecycle: lifecycleEnum.singleton,
});

export default configMapStoreInjectable;
