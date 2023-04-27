/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectOnContextMenuOpenContext } from "../../kube-object/handler";
import kubeObjectHandlersInjectable from "../../kube-object/handlers.injectable";

export type OnKubeObjectContextMenuOpen = (obj: KubeObject, ctx: KubeObjectOnContextMenuOpenContext) => void;

const onKubeObjectContextMenuOpenInjectable = getInjectable({
  id: "on-kube-object-context-menu-open",
  instantiate: (di): OnKubeObjectContextMenuOpen => {
    const handlers = di.inject(kubeObjectHandlersInjectable);

    return (obj, ctx) => {
      const specificHandlers = handlers.get().get(obj.apiVersion)?.get(obj.kind) ?? [];

      for (const { onContextMenuOpen } of specificHandlers) {
        onContextMenuOpen?.(ctx);
      }
    };
  },
});

export default onKubeObjectContextMenuOpenInjectable;
