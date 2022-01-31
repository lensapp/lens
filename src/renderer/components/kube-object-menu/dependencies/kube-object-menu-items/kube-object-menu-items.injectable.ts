/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

import { getKubeObjectMenuItems } from "./get-kube-object-menu-items";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";
import rendererExtensionsInjectable from "../../../../../extensions/renderer-extensions.injectable";

const kubeObjectMenuItemsInjectable = getInjectable({
  instantiate: (di, { kubeObject }: { kubeObject: KubeObject }) =>
    getKubeObjectMenuItems({
      extensions: di.inject(rendererExtensionsInjectable).get(),
      kubeObject,
    }),

  lifecycle: lifecycleEnum.transient,
});

export default kubeObjectMenuItemsInjectable;
