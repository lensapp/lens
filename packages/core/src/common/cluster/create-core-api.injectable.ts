/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { CoreV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";

export type CreateCoreApi = (config: KubeConfig) => CoreV1Api;

const createCoreApiInjectable = getInjectable({
  id: "create-core-api",
  instantiate: (): CreateCoreApi => config => config.makeApiClient(CoreV1Api),
});

export default createCoreApiInjectable;
