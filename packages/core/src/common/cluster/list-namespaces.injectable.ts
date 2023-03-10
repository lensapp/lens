/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { CoreV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { isDefined } from "@k8slens/utilities";

export type ListNamespaces = () => Promise<string[]>;

export type CreateListNamespaces = (config: KubeConfig) => ListNamespaces;

const createListNamespacesInjectable = getInjectable({
  id: "create-list-namespaces",
  instantiate: (): CreateListNamespaces => (config) => {
    const coreApi = config.makeApiClient(CoreV1Api);

    return async () => {
      const { body: { items }} = await coreApi.listNamespace();

      return items
        .map(ns => ns.metadata?.name)
        .filter(isDefined);
    };
  },
});

export default createListNamespacesInjectable;
