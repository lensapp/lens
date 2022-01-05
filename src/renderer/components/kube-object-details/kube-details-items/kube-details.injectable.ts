/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
