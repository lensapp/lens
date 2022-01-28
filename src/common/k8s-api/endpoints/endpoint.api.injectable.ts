/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { EndpointApi } from "./endpoint.api";

const endpointApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/endpoints") as EndpointApi,
  lifecycle: lifecycleEnum.singleton,
});

export default endpointApiInjectable;
