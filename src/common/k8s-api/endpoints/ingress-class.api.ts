/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { ResourceDescriptor } from "../kube-api";
import { KubeApi } from "../kube-api";

export class IngressClassApi extends KubeApi<IngressClass> {
  constructor() {
    super({
      objectConstructor: IngressClass,
      checkPreferredVersion: true,
      fallbackApiBases: ["/apis/extensions/v1beta1/ingressclasses"],
    });
  }

  setAsDefault({ name }: ResourceDescriptor, isDefault = true) {
    const reqUrl = this.formatUrlForNotListing({ name });

    return this.request.patch(reqUrl, {
      data: {
        metadata: {
          annotations: {
            [IngressClass.ANNOTATION_IS_DEFAULT]: JSON.stringify(isDefault),
          },
        },
      },
    }, {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }
}

// API docs: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#ingressclass-v1-networking-k8s-io
export type IngressClassMetadata = KubeObjectMetadata<KubeObjectScope.Cluster> & {
  "name": string;
  "labels"?: {
    [name: string]: string | undefined;
    "app.kubernetes.io/component"?: "controller";
  };
  "annotations"?: {
    [name: string]: string | undefined;
    "ingressclass.kubernetes.io/is-default-class"?: "true";
  };
};

export interface IngressClassParametersReference {
  "apiGroup": string; // k8s.example.net
  "scope": "Namespace" | "Cluster";
  "kind": "ClusterIngressParameter" | "IngressParameter";
  "name": string; // external-config-1
  "namespace"?: string; // namespaced for IngressClass must be defined in `spec.parameters.namespace` instead of `metadata.namespace` (!)
}

export interface IngressClassSpec {
  controller: string; // "example.com/ingress-controller"
  parameters?: IngressClassParametersReference;
}

export interface IngressClassStatus {
}

export class IngressClass extends KubeObject<IngressClassMetadata, IngressClassStatus, IngressClassSpec> {
  static readonly kind = "IngressClass";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/networking.k8s.io/v1/ingressclasses";
  static readonly ANNOTATION_IS_DEFAULT = "ingressclass.kubernetes.io/is-default-class";

  getController(): string {
    return this.spec.controller;
  }

  getCtrlApiGroup() {
    return this.spec?.parameters?.apiGroup;
  }

  getCtrlScope() {
    return this.spec?.parameters?.scope;
  }

  getCtrlNs() {
    return this.spec?.parameters?.namespace;
  }

  getCtrlKind() {
    return this.spec?.parameters?.kind;
  }

  getCtrlName() {
    return this.spec?.parameters?.name as string;
  }

  get isDefault() {
    return this.metadata.annotations?.[IngressClass.ANNOTATION_IS_DEFAULT] === "true";
  }
}
