/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObject } from "../../../../common/k8s-api/kube-object";

export const kubeObjectMatchesToKindAndApiVersion =
  (kind: string, apiVersions: string[]) =>
  <TKubeObject extends KubeObject>(item: TKubeObject | undefined) =>
      !!item && item.kind === kind && apiVersions.includes(item.apiVersion);
