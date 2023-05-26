/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../../common/rbac";
import { apiResourceRecord } from "../../common/rbac";
import { getLegacyGlobalDiForExtensionApi, asLegacyGlobalForExtensionApi, asLegacyGlobalFunctionForExtensionApi } from "@k8slens/legacy-global-di";
import * as kubeApiSpecifics from "@k8slens/kube-api-specifics";
import { shouldShowResourceInjectionToken } from "../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import requestMetricsInjectable from "../../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";

export function isAllowedResource(resources: KubeResource | KubeResource[]) {
  const di = getLegacyGlobalDiForExtensionApi();

  return [resources].flat().every((resourceName) => {
    const resource = apiResourceRecord[resourceName];

    if (!resource) {
      return true;
    }

    const _isAllowedResource = di.inject(shouldShowResourceInjectionToken, {
      apiName: resourceName,
      group: resource.group,
    });

    // Note: Legacy isAllowedResource does not advertise reactivity
    return _isAllowedResource.get();
  });
}

export const serviceAccountsApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.serviceAccountApiInjectable);
export const clusterRoleApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.clusterRoleApiInjectable);
export const clusterRoleBindingApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.clusterRoleBindingApiInjectable);
export const roleApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.roleApiInjectable);
export const podsApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.podApiInjectable);
export const daemonSetApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.daemonSetApiInjectable);
export const replicaSetApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.replicaSetApiInjectable);
export const statefulSetApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.statefulSetApiInjectable);
export const deploymentApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.deploymentApiInjectable);
export const jobApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.jobApiInjectable);
export const cronJobApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.cronJobApiInjectable);
export const nodesApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.nodeApiInjectable);
export const secretsApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.secretApiInjectable);
export const configMapApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.configMapApiInjectable);
export const resourceQuotaApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.resourceQuotaApiInjectable);
export const limitRangeApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.limitRangeApiInjectable);
export const serviceApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.serviceApiInjectable);
export const hpaApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.horizontalPodAutoscalerApiInjectable);
export const vpaApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.verticalPodAutoscalerApiInjectable);
export const pdbApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.podDisruptionBudgetApiInjectable);
export const pcApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.priorityClassApiInjectable);
export const endpointApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.endpointsApiInjectable);
export const ingressApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.ingressApiInjectable);
export const networkPolicyApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.networkPolicyApiInjectable);
export const persistentVolumeApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.persistentVolumeApiInjectable);
export const pvcApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.persistentVolumeClaimApiInjectable);
export const storageClassApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.storageClassApiInjectable);
export const namespacesApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.namespaceApiInjectable);
export const eventApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.kubeEventApiInjectable);
export const roleBindingApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.roleBindingApiInjectable);
export const crdApi = asLegacyGlobalForExtensionApi(kubeApiSpecifics.customResourceDefinitionApiInjectable);

export * from "../common-api/k8s-api";

export const requestMetrics = asLegacyGlobalFunctionForExtensionApi(requestMetricsInjectable);

export type {
  RequestMetrics,
  RequestMetricsParams,
} from "../../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
export type {
  MetricData,
  MetricResult,
} from "../../common/k8s-api/endpoints/metrics.api";

export {
  KubeObjectStatusLevel,
  type KubeObjectStatus,
} from "../../common/k8s-api/kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/events/store";
export type { PodStore as PodsStore } from "../../renderer/components/workloads-pods/store";
export type { NodeStore as NodesStore } from "../../renderer/components/nodes/store";
export type { DeploymentStore } from "../../renderer/components/workloads-deployments/store";
export type { DaemonSetStore } from "../../renderer/components/workloads-daemonsets/store";
export type { StatefulSetStore } from "../../renderer/components/workloads-statefulsets/store";
export type { JobStore } from "../../renderer/components/workloads-jobs/store";
export type { CronJobStore } from "../../renderer/components/workloads-cronjobs/store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/config-maps/store";
export type { SecretStore as SecretsStore } from "../../renderer/components/config-secrets/store";
export type { ReplicaSetStore } from "../../renderer/components/workloads-replicasets/store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/config-resource-quotas/store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/config-limit-ranges/store";
export type {
  /**
   * @deprecated
   */
  HorizontalPodAutoscalerStore as HPAStore,
  HorizontalPodAutoscalerStore,
} from "../../renderer/components/config-horizontal-pod-autoscalers/store";
export type { VerticalPodAutoscalerStore } from "../../renderer/components/config-vertical-pod-autoscalers/store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/config-pod-disruption-budgets/store";
export type { PriorityClassStore as PriorityClassStoreStore } from "../../renderer/components/config-priority-classes/store";
export type { ServiceStore } from "../../renderer/components/network-services/store";
export type { EndpointsStore as EndpointStore } from "../../renderer/components/network-endpoints/store";
export type { IngressStore } from "../../renderer/components/network-ingresses/ingress-store";
export type { IngressClassStore } from "../../renderer/components/network-ingresses/ingress-class-store";
export type { NetworkPolicyStore } from "../../renderer/components/network-policies/store";
export type { PersistentVolumeStore as PersistentVolumesStore } from "../../renderer/components/storage-volumes/store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/storage-volume-claims/store";
export type { StorageClassStore } from "../../renderer/components/storage-classes/store";
export type { NamespaceStore } from "../../renderer/components/namespaces/store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/user-management/service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/user-management/roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/user-management/role-bindings/store";
export type { CustomResourceDefinitionStore as CRDStore } from "../../renderer/components/custom-resource-definitions/store";
export type { CustomResourceStore as CRDResourceStore } from "../../common/k8s-api/api-manager/resource.store";
