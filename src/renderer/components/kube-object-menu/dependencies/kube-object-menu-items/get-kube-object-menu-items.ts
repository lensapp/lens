/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObjectMenuRegistry } from "../../../../../extensions/registries";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";

export const getKubeObjectMenuItems = ({
  kubeObjectMenuRegistry,
  kubeObject,
}: {
  kubeObjectMenuRegistry: KubeObjectMenuRegistry;
  kubeObject: KubeObject;
}) => {
  if (!kubeObject) {
    return [];
  }

  return kubeObjectMenuRegistry
    .getItemsForKind(kubeObject.kind, kubeObject.apiVersion)
    .map((item) => item.components.MenuItem);
};
