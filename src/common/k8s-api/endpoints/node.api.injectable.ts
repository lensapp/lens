/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { NodeApi } from "./node.api";
import apiManagerInjectable from "../api-manager.injectable";

const nodeApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/api/v1/nodes") as NodeApi,
  lifecycle: lifecycleEnum.singleton,
});

export default nodeApiInjectable;
