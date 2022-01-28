/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { DaemonSetApi } from "./daemon-set.api";

const daemonSetApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/apps/v1/daemonsets") as DaemonSetApi,
  lifecycle: lifecycleEnum.singleton,
});

export default daemonSetApiInjectable;
