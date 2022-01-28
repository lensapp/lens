/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ResourceQuotaStore } from "./store";

const resourceQuotaStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/api/v1/resourcequotas") as ResourceQuotaStore,
  lifecycle: lifecycleEnum.singleton,
});

export default resourceQuotaStoreInjectable;
