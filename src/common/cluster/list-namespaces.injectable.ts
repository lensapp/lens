/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { CoreV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { isDefined } from "../utils";
import makeApiClientInjectable from "./make-api-client.injectable";

export type ListNamespaces = () => Promise<string[]>;

const listNamespacesInjectable = getInjectable({
  id: "list-namespaces",
  instantiate: (di) => {
    const makeApiClient = di.inject(makeApiClientInjectable);

    return (config: KubeConfig): ListNamespaces => {
      const coreApi = makeApiClient(config, CoreV1Api);

      return async () => {
        const { body: { items }} = await coreApi.listNamespace();

        return items
          .map(ns => ns.metadata?.name)
          .filter(isDefined);
      };
    };
  },
});

export default listNamespacesInjectable;
