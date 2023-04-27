/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseKubeObjectCondition, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { CrossVersionObjectReference } from "../types/cross-version-object-reference";

export enum ResourceName {
  ResourceCPU = "cpu",
  ResourceMemory = "memory",
  ResourceStorage = "storage",
}

export type ResourceList = Partial<Record<string, string>>;

export interface RecommendedContainerResources {
  containerName?: string;
  target: ResourceList;
  lowerBound?: ResourceList;
  upperBound?: ResourceList;
  uncappedTarget?: ResourceList;
}
export interface RecommendedPodResources {
  containerRecommendations?: RecommendedContainerResources[];
}

export interface VerticalPodAutoscalerStatus {
  conditions?: BaseKubeObjectCondition[];
  recommendation?: RecommendedPodResources;
}

export interface VerticalPodAutoscalerRecommenderSelector {
  name: string;
}

export enum ContainerScalingMode {
  ContainerScalingModeAuto = "Auto",
  ContainerScalingModeOff = "Off",
}

export enum ControlledValues {
  ControlledValueRequestsAndLimits = "RequestsAndLimits",
  ControlledValueRequestsOnly = "RequestsOnly",
}

/**
 * ContainerResourcePolicy controls how autoscaler computes the recommended resources for
 * a specific container.
 */
export interface ContainerResourcePolicy {
  containerName?: string;
  mode?: ContainerScalingMode;
  minAllowed?: ResourceList;
  maxAllowed?: ResourceList;
  controlledResources?: ResourceName[];
  controlledValues?: ControlledValues;
}

/**
 * Controls how the autoscaler computes recommended resources.
 * The resource policy may be used to set constraints on the recommendations for individual
 * containers.
 * If not specified, the autoscaler computes recommended resources for all containers in the
 * pod, without additional constraints.
 */
export interface PodResourcePolicy {
  containerPolicies?: ContainerResourcePolicy[]; // Per-container resource policies.
}

export enum UpdateMode {
  /**
   * UpdateModeOff means that autoscaler never changes Pod resources.
   * The recommender still sets the recommended resources in the
   * VerticalPodAutoscaler object. This can be used for a "dry run".
   */
  UpdateModeOff = "Off",
  /**
   * UpdateModeInitial means that autoscaler only assigns resources on pod
   * creation and does not change them during the lifetime of the pod.
   */
  UpdateModeInitial = "Initial",
  /**
   * UpdateModeRecreate means that autoscaler assigns resources on pod
   * creation and additionally can update them during the lifetime of the
   * pod by deleting and recreating the pod.
   */
  UpdateModeRecreate = "Recreate",
  /**
   * UpdateModeAuto means that autoscaler assigns resources on pod creation
   * and additionally can update them during the lifetime of the pod,
   * using any available update method. Currently this is equivalent to
   * Recreate, which is the only available update method.
   */
  UpdateModeAuto = "Auto",
}
export interface PodUpdatePolicy {
  minReplicas?: number;
  updateMode?: UpdateMode;
}

export interface VerticalPodAutoscalerSpec {
  targetRef: CrossVersionObjectReference;
  updatePolicy?: PodUpdatePolicy;
  resourcePolicy?: PodResourcePolicy;
  recommenders?: VerticalPodAutoscalerRecommenderSelector[];
}

export class VerticalPodAutoscaler extends KubeObject<
  NamespaceScopedMetadata,
  VerticalPodAutoscalerStatus,
  VerticalPodAutoscalerSpec
> {
  static readonly kind = "VerticalPodAutoscaler";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/autoscaling.k8s.io/v1/verticalpodautoscalers";

  getReadyConditions() {
    return this.getConditions().filter(({ isReady }) => isReady);
  }

  getConditions() {
    return (
      this.status?.conditions?.map((condition) => {
        const { message, reason, lastTransitionTime, status } = condition;

        return {
          ...condition,
          isReady: status === "True",
          tooltip: `${message || reason || ""} (${lastTransitionTime})`,
        };
      }) ?? []
    );
  }

  getMode() {
    return this.spec.updatePolicy?.updateMode ?? UpdateMode.UpdateModeAuto;
  }
}
