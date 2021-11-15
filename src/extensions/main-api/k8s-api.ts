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
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { Pod, podsApi, PodsApi } from "../../common/k8s-api/endpoints/pods.api";
export { Node, nodesApi, NodesApi } from "../../common/k8s-api/endpoints/nodes.api";
export { Deployment, deploymentApi, DeploymentApi } from "../../common/k8s-api/endpoints/deployment.api";
export { DaemonSet, daemonSetApi } from "../../common/k8s-api/endpoints/daemon-set.api";
export { StatefulSet, statefulSetApi } from "../../common/k8s-api/endpoints/stateful-set.api";
export { Job, jobApi } from "../../common/k8s-api/endpoints/job.api";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints/cron-job.api";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints/configmap.api";
export { Secret, secretsApi } from "../../common/k8s-api/endpoints/secret.api";
export { ReplicaSet, replicaSetApi } from "../../common/k8s-api/endpoints/replica-set.api";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints/resource-quota.api";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints/limit-range.api";
export { HorizontalPodAutoscaler, hpaApi } from "../../common/k8s-api/endpoints/hpa.api";
export { PodDisruptionBudget, pdbApi } from "../../common/k8s-api/endpoints/poddisruptionbudget.api";
export { Service, serviceApi } from "../../common/k8s-api/endpoints/service.api";
export { Endpoint, endpointApi } from "../../common/k8s-api/endpoints/endpoint.api";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints/ingress.api";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints/network-policy.api";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints/persistent-volume.api";
export { PersistentVolumeClaim, pvcApi, PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints/persistent-volume-claims.api";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints/storage-class.api";
export { Namespace, namespacesApi } from "../../common/k8s-api/endpoints/namespaces.api";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints/events.api";
export { ServiceAccount, serviceAccountsApi } from "../../common/k8s-api/endpoints/service-accounts.api";
export { Role, roleApi } from "../../common/k8s-api/endpoints/role.api";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints/role-binding.api";
export { ClusterRole, clusterRoleApi } from "../../common/k8s-api/endpoints/cluster-role.api";
export { ClusterRoleBinding, clusterRoleBindingApi } from "../../common/k8s-api/endpoints/cluster-role-binding.api";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints/crd.api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints/pods.api";
export type { ISecretRef } from "../../common/k8s-api/endpoints/secret.api";
