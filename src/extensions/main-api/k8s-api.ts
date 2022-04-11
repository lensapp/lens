/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import clusterRoleBindingApiInjectable from "../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import clusterRoleApiInjectable from "../../common/k8s-api/endpoints/cluster-role.api.injectable";
import roleApiInjectable from "../../common/k8s-api/endpoints/role.api.injectable";
import serviceAccountApiInjectable from "../../common/k8s-api/endpoints/service-account.api.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

/**
 * @deprecated This function never works
 * @returns false
 */
export function isAllowedResource(...args: any[]) {
  return Boolean(void args);
}

export const serviceAccountsApi = asLegacyGlobalForExtensionApi(serviceAccountApiInjectable);
export const clusterRoleApi = asLegacyGlobalForExtensionApi(clusterRoleApiInjectable);
export const clusterRoleBindingApi = asLegacyGlobalForExtensionApi(clusterRoleBindingApiInjectable);
export const roleApi = asLegacyGlobalForExtensionApi(roleApiInjectable);

export { ResourceStack } from "../../common/k8s/resource-stack";
export { apiManager } from "../../common/k8s-api/api-manager";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { Pod, podApi as podsApi, PodApi as PodsApi } from "../../common/k8s-api/endpoints/pods.api";
export { Node, nodeApi as nodesApi, NodeApi as NodesApi } from "../../common/k8s-api/endpoints/nodes.api";
export { Deployment, deploymentApi, DeploymentApi } from "../../common/k8s-api/endpoints/deployment.api";
export { DaemonSet, daemonSetApi } from "../../common/k8s-api/endpoints/daemon-set.api";
export { StatefulSet, statefulSetApi } from "../../common/k8s-api/endpoints/stateful-set.api";
export { Job, jobApi } from "../../common/k8s-api/endpoints/job.api";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints/cron-job.api";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints/configmap.api";
export { Secret, secretApi as secretsApi } from "../../common/k8s-api/endpoints/secret.api";
export { ReplicaSet, replicaSetApi } from "../../common/k8s-api/endpoints/replica-set.api";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints/resource-quota.api";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints/limit-range.api";
export { HorizontalPodAutoscaler, horizontalPodAutoscalerApi as hpaApi } from "../../common/k8s-api/endpoints/hpa.api";
export { PodDisruptionBudget, podDisruptionBudgetApi as pdbApi } from "../../common/k8s-api/endpoints/poddisruptionbudget.api";
export { Service, serviceApi } from "../../common/k8s-api/endpoints/service.api";
export { Endpoints as Endpoint, endpointsApi as endpointApi } from "../../common/k8s-api/endpoints/endpoint.api";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints/ingress.api";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints/network-policy.api";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints/persistent-volume.api";
export { PersistentVolumeClaim, persistentVolumeClaimApi as pvcApi, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints/persistent-volume-claims.api";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints/storage-class.api";
export { Namespace, namespaceApi as namespacesApi } from "../../common/k8s-api/endpoints/namespaces.api";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints/events.api";
export { ServiceAccount } from "../../common/k8s-api/endpoints/service-account.api";
export { Role } from "../../common/k8s-api/endpoints/role.api";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints/role-binding.api";
export { ClusterRole } from "../../common/k8s-api/endpoints/cluster-role.api";
export { ClusterRoleBinding } from "../../common/k8s-api/endpoints/cluster-role-binding.api";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints/crd.api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { PodContainer as IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints/pods.api";
export type { SecretReference as ISecretRef } from "../../common/k8s-api/endpoints/secret.api";
export type { KubeObjectMetadata, KubeJsonApiObjectMetadata, KubeStatusData } from "../../common/k8s-api/kube-object";
export type { KubeObjectStoreLoadAllParams, KubeObjectStoreLoadingParams, KubeObjectStoreSubscribeParams } from "../../common/k8s-api/kube-object.store";
