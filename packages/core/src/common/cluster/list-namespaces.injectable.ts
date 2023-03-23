/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { CoreV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { isDefined } from "@k8slens/utilities";

export type ListNamespaces = () => Promise<string[]>;
export type CreateListNamespaces = (api: CoreV1Api) => ListNamespaces;

const createListNamespacesInjectable = getInjectable({
  id: "create-list-namespaces",
  instantiate: (): CreateListNamespaces => (api) => async () => {
    const { body: { items }} = await api.listNamespace();

    return items
      .map(ns => ns.metadata?.name)
      .filter(isDefined);
  },
});

export default createListNamespacesInjectable;
