/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { StatefulSetApi } from "./stateful-set.api";

const statefulSetApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/apps/v1/statefulsets") as StatefulSetApi,
  lifecycle: lifecycleEnum.singleton,
});

export default statefulSetApiInjectable;
