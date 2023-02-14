/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type {
  BaseKubeObjectCondition,
  KubeObjectStatus,
  NamespaceScopedMetadata
} from "../kube-object";
import { KubeObject } from "../kube-object";
import type { PodTemplateSpec } from "./types";

export class ReplicationControllerApi extends KubeApi<ReplicationController> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: ReplicationController,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.formatUrlForNotListing(params)}/scale`;
  }

  getScale(params: { namespace: string; name: string }) {
    return this.request.get(this.getScaleApiUrl(params));
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.patch(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas,
        },
      },
    });
  }

}

export interface ReplicationControllerSpec {
  /**
   * Minimum number of seconds for which a newly created pod should be ready without any of its container crashing, for it to be considered available.
   * Defaults to 0 (pod will be considered available as soon as it is ready)
   */
  minReadySeconds?: number;
  /**
   * Replicas is the number of desired replicas. This is a pointer to distinguish between explicit zero and unspecified.
   * Defaults to 1. More info: https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller#what-is-a-replicationcontroller
   */
  replicas?: number;
  /**
   * Selector is a label query over pods that should match the Replicas count. If Selector is empty, it is defaulted to the labels present on the Pod template.
   * Label keys and values that must match in order to be controlled by this replication controller, if empty defaulted to labels on Pod template.
   * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors
   */
  selector?: Record<string, string>;
  /**
   * Template is the object that describes the pod that will be created if insufficient replicas are detected. This takes precedence over a TemplateRef.
   * More info: https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller#pod-template
   */
  template?: PodTemplateSpec;
}

export interface ReplicationControllerStatus extends KubeObjectStatus {
  /**
   * The number of available replicas (ready for at least minReadySeconds) for this replication controller.
   */
  availableReplicas: number;
  /**
   * The number of pods that have labels matching the labels of the pod template of the replication controller.
   */
  fullyLabeledReplicas: number;
  /**
   * ObservedGeneration reflects the generation of the most recently observed replication controller.
   */
  observedGeneration: number;
  /**
   * The number of ready replicas for this replication controller.
   */
  readyReplicas: number;
  /**
   * Replicas is the most recently observed number of replicas.
   * More info: https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller#what-is-a-replicationcontroller
   */
  replicas: number;
}

export class ReplicationController extends KubeObject<
  NamespaceScopedMetadata,
  ReplicationControllerStatus,
  ReplicationControllerSpec
> {
  static kind = "ReplicationController";
  static namespaced = true;
  static apiBase = "/api/v1/replicationcontrollers";

  getMinReadySeconds(): number {
    return this.spec?.minReadySeconds ?? 0;
  }

  getDesiredReplicas(): number | undefined {
    return this.spec?.replicas;
  }

  getSelectorLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector);
  }

  getReplicas(): number | undefined {
    return this.status?.replicas;
  }

  getAvailableReplicas(): number | undefined {
    return this.status?.availableReplicas;
  }

  getLabeledReplicas(): number | undefined {
    return this.status?.fullyLabeledReplicas;
  }

  getConditions(): BaseKubeObjectCondition[] {
    return this.status?.conditions ?? [];
  }
}
