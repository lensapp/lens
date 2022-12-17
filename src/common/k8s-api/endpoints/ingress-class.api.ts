/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeApi } from "../kube-api";

export class IngressClassApi extends KubeApi<IngressClass> {
  constructor() {
    super({
      objectConstructor: IngressClass,
    });
  }
}

// API docs: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#ingressclass-v1-networking-k8s-io
export type IngressClassMetadata = KubeObjectMetadata<KubeObjectScope.Namespace> & {
  "name": string;
  "labels"?: {
    [name: string]: string | undefined;
    "app.kubernetes.io/component"?: "controller"
  }
  "annotations"?: {
    [name: string]: string | undefined;
    "ingressclass.kubernetes.io/is-default-class"?: "true",
  }
};

export interface IngressClassParametersReference {
  "apiGroup": string; // k8s.example.net
  "scope": "Namespace" | "Cluster"
  "kind": "ClusterIngressParameter" | "IngressParameter"
  "name": string; // external-config-1
  "namespace"?: string; // namespaced for IngressClass must be defined in `spec.parameters.namespace` instead of `metadata.namespace` (!)
}

export interface IngressClassSpec {
  "controller": string; // example.com/ingress-controller
  "parameters": IngressClassParametersReference,
}

export interface IngressClassStatus {
}

export class IngressClass extends KubeObject<IngressClassMetadata, IngressClassStatus, IngressClassSpec> {
  static readonly kind = "IngressClass";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/networking.k8s.io/v1/ingressclasses";

}
