/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { orderBy } from "lodash";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { internalItems } from "./internal-items";
import type { KubeObjectDetailComponents } from "./kube-detail-items";

type Kind = string;
type ApiVersion = string;

const kubeDetailItemsInjectable = getInjectable({
  instantiate: di => computed(() => {
    const res = new Map<Kind, Map<ApiVersion, KubeObjectDetailComponents[]>>();
    const extensionItems = di.inject(rendererExtensionsInjectable).get()
      .flatMap(ext => ext.kubeObjectDetailItems)
      .map(({ priority = 50, ...item }) => ({ priority, ...item }));
    const items = orderBy([...internalItems, ...extensionItems], "priority", "desc");

    for (const item of items) {
      if (!res.has(item.kind)) {
        res.set(item.kind, new Map());
      }

      const byVersions = res.get(item.kind);

      for (const apiVersion of item.apiVersions) {
        if (!byVersions.has(apiVersion)) {
          byVersions.set(apiVersion, []);
        }

        byVersions.get(apiVersion).push(item.components);
      }
    }

    return res;
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default kubeDetailItemsInjectable;
