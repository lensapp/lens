/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { Namespace } from "@k8slens/kube-object";
import type { KubeObjectOnContextMenuOpenContext } from "../../kube-object/handler";
import { staticKubeObjectHandlerInjectionToken } from "../../kube-object/handler";
import requestDeleteNamespaceInjectable from "./request-delete-namespace.injectable";

const namespaceRemoveContextMenuOverridingListenerInjectable = getInjectable({
  id: "namespace-remove-context-menu-overriding-listener",
  instantiate: (di) => {
    const requestDeleteNamespace = di.inject(requestDeleteNamespaceInjectable);

    return ({
      apiVersions: ["v1"],
      kind: "Namespace",
      onContextMenuOpen: action((ctx: KubeObjectOnContextMenuOpenContext) => {
        ctx.menuItems.replace([
          {
            id: "new-delete-kube-object",
            icon: "delete",
            title: "Delete",
            onClick: (obj) => requestDeleteNamespace(obj as Namespace),
          },
          ...ctx.menuItems.filter((menuItem) => menuItem.id !== "delete-kube-object"),
        ]);
      }),
    });
  },
  injectionToken: staticKubeObjectHandlerInjectionToken,
});

export default namespaceRemoveContextMenuOverridingListenerInjectable;
