/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { Ingress, IngressApi } from "../../../common/k8s-api/endpoints";
import { ingressApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../utils";

export class IngressStore extends KubeObjectStore<Ingress, IngressApi> {
}

export const ingressStore = isClusterPageContext()
  ? new IngressStore(ingressApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(ingressStore);
}
