/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ReplicaSetStore } from "../../../extensions/renderer-api/k8s-api";

const replicaSetStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/apps/v1/replicasets") as ReplicaSetStore,
  lifecycle: lifecycleEnum.singleton,
});

export default replicaSetStoreInjectable;
