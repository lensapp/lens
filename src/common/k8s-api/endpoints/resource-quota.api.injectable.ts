/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { ResourceQuotaApi } from "./resource-quota.api";

const resourceQuotaApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/resourcequotas") as ResourceQuotaApi,
  lifecycle: lifecycleEnum.singleton,
});

export default resourceQuotaApiInjectable;
