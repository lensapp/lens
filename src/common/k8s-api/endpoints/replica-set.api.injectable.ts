/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { ReplicaSetApi } from "./replica-set.api";

const replicaSetApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/apps/v1/replicasets") as ReplicaSetApi,
  lifecycle: lifecycleEnum.singleton,
});

export default replicaSetApiInjectable;
