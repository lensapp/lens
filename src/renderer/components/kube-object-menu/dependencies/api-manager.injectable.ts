/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../../common/k8s-api/api-manager";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const apiManagerInjectable = getInjectable({
  instantiate: () => apiManager,
  lifecycle: lifecycleEnum.singleton,
});

export default apiManagerInjectable;
