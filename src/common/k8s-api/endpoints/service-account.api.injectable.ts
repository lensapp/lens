/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { ServiceAccountApi } from "./service-account.api";

const serviceAccountApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/serviceaccounts") as ServiceAccountApi,
  lifecycle: lifecycleEnum.singleton,
});

export default serviceAccountApiInjectable;
