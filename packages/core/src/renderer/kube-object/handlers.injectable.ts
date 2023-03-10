/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../extensions/renderer-extensions.injectable";
import { getOrInsert, getOrInsertMap, readonly } from "@k8slens/utilities";
import type { KubeObjectHandlerRegistration, KubeObjectHandlers } from "./handler";
import { staticKubeObjectHandlerInjectionToken } from "./handler";

const kubeObjectHandlersInjectable = getInjectable({
  id: "kube-object-handlers",
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);
    const staticKubeObjectContextMenuHandlers = di.injectMany(staticKubeObjectHandlerInjectionToken);

    return computed(() => {
      const res = new Map<string, Map<string, Partial<KubeObjectHandlers>[]>>();
      const addAllHandlers = (registrations: KubeObjectHandlerRegistration[]) => {
        for (const { apiVersions, kind, ...handlers } of registrations) {
          for (const apiVersion of apiVersions) {
            const byApiVersion = getOrInsertMap(res, apiVersion);
            const byKind = getOrInsert(byApiVersion, kind, []);

            byKind.push(handlers);
          }
        }
      };

      extensions.get()
        .map(ext => ext.kubeObjectHandlers)
        .forEach(addAllHandlers);

      addAllHandlers(staticKubeObjectContextMenuHandlers);

      return readonly(res);
    });
  },
});

export default kubeObjectHandlersInjectable;
