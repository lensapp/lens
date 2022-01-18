/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import kubeObjectMenuRegistryInjectable from "./kube-object-menu-registry.injectable";

import { getKubeObjectMenuItems } from "./get-kube-object-menu-items";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";

const kubeObjectMenuItemsInjectable = getInjectable({
  instantiate: (di, { kubeObject }: { kubeObject: KubeObject }) =>
    getKubeObjectMenuItems({
      kubeObjectMenuRegistry: di.inject(kubeObjectMenuRegistryInjectable),
      kubeObject,
    }),

  lifecycle: lifecycleEnum.transient,
});

export default kubeObjectMenuItemsInjectable;
