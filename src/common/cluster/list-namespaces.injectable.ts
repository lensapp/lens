/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { CoreV1Api, KubeConfig } from "@kubernetes/client-node";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

export type ListNamespaces = () => Promise<string[]>;

export function listNamespaces(config: KubeConfig): ListNamespaces {
  const coreApi = config.makeApiClient(CoreV1Api);

  return async () => {
    const { body: { items }} = await coreApi.listNamespace();

    return items.map(ns => ns.metadata.name);
  };
}

const listNamespacesInjectable = getInjectable({
  instantiate: () => listNamespaces,
  lifecycle: lifecycleEnum.singleton,
});

export default listNamespacesInjectable;
