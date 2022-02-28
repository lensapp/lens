/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../../common/rbac";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { castArray } from "lodash/fp";

export function isAllowedResource(resource: KubeResource | KubeResource[]) {
  const _isAllowedResource = asLegacyGlobalFunctionForExtensionApi(isAllowedResourceInjectable);

  const resources = castArray(resource);

  return resources.every(_isAllowedResource);
}

export * from "../common-k8s-api";

export type {
  KubeResource,
} from "../../common/rbac";
export type {
  IKubeObjectRef,
} from "../../common/k8s-api/kube-api-parse";
export {
  apiManager,
} from "../../common/k8s-api/api-manager";
export type {
  ApiManager,
} from "../../common/k8s-api/api-manager";
export {
  clusterRoleApi,
  clusterRoleBindingApi,
  configMapApi,
  crdApi,
  cronJobApi,
  daemonSetApi,
  deploymentApi,
  endpointApi,
  eventApi,
  hpaApi,
  ingressApi,
  jobApi,
  limitRangeApi,
  namespacesApi,
  networkPolicyApi,
  nodesApi,
  pdbApi,
  persistentVolumeApi,
  podsApi,
  pvcApi,
  replicaSetApi,
  resourceQuotaApi,
  roleApi,
  roleBindingApi,
  secretsApi,
  serviceAccountsApi,
  serviceApi,
  statefulSetApi,
  storageClassApi,
} from "../../common/k8s-api/endpoints";

// stores
export type { ClusterRoleBindingsStore } from "../../renderer/components/+user-management/+cluster-role-bindings/store";
export type { ClusterRolesStore } from "../../renderer/components/+user-management/+cluster-roles/store";
export type { ConfigMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resources/crd-resource.store";
export type { CRDStore } from "../../renderer/components/+custom-resources/crd.store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
export type { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
export type { EventStore } from "../../renderer/components/+events/event.store";
export type { HPAStore } from "../../renderer/components/+config-autoscalers/hpa.store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
export type { LimitRangesStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace-store/namespace.store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
export type { NodesStore } from "../../renderer/components/+nodes/nodes.store";
export type { PersistentVolumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
export type { PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
export type { PodsStore } from "../../renderer/components/+workloads-pods/pods.store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
export type { ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
export type { RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { SecretsStore } from "../../renderer/components/+config-secrets/secrets.store";
export type { ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { ServiceStore } from "../../renderer/components/+network-services/services.store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
export type { VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
export type {
  KubeObjectStoreLoadAllParams,
  KubeObjectStoreLoadingParams,
  KubeObjectStoreSubscribeParams,
} from "../../common/k8s-api/kube-object.store";
