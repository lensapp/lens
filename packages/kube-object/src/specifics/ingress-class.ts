import type { ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface IngressClassParametersReference {
  /**
   * For example: `"k8s.example.net"`
   */
  apiGroup: string;
  scope: "Namespace" | "Cluster";
  kind: "ClusterIngressParameter" | "IngressParameter";
  name: string;
  /**
   * The namespace for IngressClass must be defined in `spec.parameters.namespace` instead of `metadata.namespace` (!)
   */
  namespace?: string;
}

export interface IngressClassSpec {
  controller: string; // "example.com/ingress-controller"
  parameters?: IngressClassParametersReference;
}

export interface IngressClassStatus {}

export class IngressClass extends KubeObject<ClusterScopedMetadata, IngressClassStatus, IngressClassSpec> {
  static readonly kind = "IngressClass";

  static readonly namespaced = false;

  static readonly apiBase = "/apis/networking.k8s.io/v1/ingressclasses";

  static readonly ANNOTATION_IS_DEFAULT = "ingressclass.kubernetes.io/is-default-class";

  getController(): string {
    return this.spec.controller;
  }

  getCtrlApiGroup() {
    return this.spec.parameters?.apiGroup;
  }

  getCtrlScope() {
    return this.spec.parameters?.scope;
  }

  getCtrlNs() {
    return this.spec.parameters?.namespace;
  }

  getCtrlKind() {
    return this.spec.parameters?.kind;
  }

  getCtrlName() {
    return this.spec.parameters?.name;
  }

  get isDefault() {
    return this.metadata.annotations?.[IngressClass.ANNOTATION_IS_DEFAULT] === "true";
  }
}
