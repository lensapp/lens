/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export { isAllowedResource } from "../../common/utils/allowed-resource";
export { ResourceStack } from "../../common/k8s/resource-stack";
export { apiManager } from "../../common/k8s-api/api-manager";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { KubeApi, forCluster } from "../../common/k8s-api/kube-api";
export { KubeObject } from "../../common/k8s-api/kube-object";
export { Pod, podsApi, PodsApi } from "../../common/k8s-api/endpoints";
export { Node, nodesApi, NodesApi } from "../../common/k8s-api/endpoints";
export { Deployment, deploymentApi, DeploymentApi } from "../../common/k8s-api/endpoints";
export { DaemonSet, daemonSetApi } from "../../common/k8s-api/endpoints";
export { StatefulSet, statefulSetApi } from "../../common/k8s-api/endpoints";
export { Job, jobApi } from "../../common/k8s-api/endpoints";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints";
export { Secret, secretsApi } from "../../common/k8s-api/endpoints";
export { ReplicaSet, replicaSetApi } from "../../common/k8s-api/endpoints";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints";
export { HorizontalPodAutoscaler, hpaApi } from "../../common/k8s-api/endpoints";
export { PodDisruptionBudget, pdbApi } from "../../common/k8s-api/endpoints";
export { Service, serviceApi } from "../../common/k8s-api/endpoints";
export { Endpoint, endpointApi } from "../../common/k8s-api/endpoints";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints";
export { PersistentVolumeClaim, pvcApi, PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints";
export { Namespace, namespacesApi } from "../../common/k8s-api/endpoints";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints";
export { ServiceAccount, serviceAccountsApi } from "../../common/k8s-api/endpoints";
export { Role, roleApi } from "../../common/k8s-api/endpoints";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints";
export { ClusterRole, clusterRoleApi } from "../../common/k8s-api/endpoints";
export { ClusterRoleBinding, clusterRoleBindingApi } from "../../common/k8s-api/endpoints";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints";
export { KubeObjectStatusLevel } from "./kube-object-status";

// types
export type { IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/+events/event.store";
export type { PodsStore } from "../../renderer/components/+workloads-pods/pods.store";
export type { NodesStore } from "../../renderer/components/+nodes/nodes.store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { ConfigMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
export type { SecretsStore } from "../../renderer/components/+config-secrets/secrets.store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
export type { ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
export type { LimitRangesStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
export type { HPAStore } from "../../renderer/components/+config-autoscalers/hpa.store";
export type { PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
export type { ServiceStore } from "../../renderer/components/+network-services/services.store";
export type { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
export type { PersistentVolumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
export type { VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace.store";
export type { ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CRDStore } from "../../renderer/components/+custom-resources/crd.store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resources/crd-resource.store";
