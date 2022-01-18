/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../common/k8s-api/api-manager";
import { Ingress, ingressApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export class IngressStore extends KubeObjectStore<Ingress> {
  api = ingressApi;
}

export const ingressStore = new IngressStore();
apiManager.registerStore(ingressStore);
