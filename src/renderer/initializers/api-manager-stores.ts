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

import { ApiManager } from "../api/api-manager";
import { clusterRoleApi, clusterRoleBindingApi, roleApi, roleBindingApi } from "../api/endpoints";
import { ClusterObjectStore } from "../components/+cluster/cluster-overview.store";
import { HpaStore } from "../components/+config-autoscalers";
import { LimitRangesStore } from "../components/+config-limit-ranges";
import { ConfigMapsStore } from "../components/+config-maps";
import { PodDisruptionBudgetsStore } from "../components/+config-pod-disruption-budgets";
import { ResourceQuotasStore } from "../components/+config-resource-quotas";
import { SecretsStore } from "../components/+config-secrets";
import { CrdStore } from "../components/+custom-resources";
import { EventStore } from "../components/+events";
import { NamespaceStore } from "../components/+namespaces";
import { EndpointStore } from "../components/+network-endpoints";
import { IngressStore } from "../components/+network-ingresses";
import { NetworkPolicyStore } from "../components/+network-policies";
import { ServiceStore } from "../components/+network-services";
import { NodesStore } from "../components/+nodes/nodes.store";
import { PodSecurityPoliciesStore } from "../components/+pod-security-policies";
import { StorageClassStore } from "../components/+storage-classes";
import { PersistentVolumeClaimStore } from "../components/+storage-volume-claims";
import { PersistentVolumesStore } from "../components/+storage-volumes";
import { RoleBindingsStore } from "../components/+user-management-roles-bindings";
import { RolesStore } from "../components/+user-management-roles";
import { ServiceAccountsStore } from "../components/+user-management-service-accounts";
import { CronJobStore } from "../components/+workloads-cronjobs";
import { DaemonSetStore } from "../components/+workloads-daemonsets";
import { DeploymentStore } from "../components/+workloads-deployments";
import { JobStore } from "../components/+workloads-jobs";
import { PodsStore } from "../components/+workloads-pods";
import { ReplicaSetStore } from "../components/+workloads-replicasets";
import { StatefulSetStore } from "../components/+workloads-statefulsets";

export function initApiManagerStores() {
  const am = ApiManager.getInstance();

  am.registerStore(HpaStore)
  am.registerStore(LimitRangesStore)
  am.registerStore(ConfigMapsStore)
  am.registerStore(PodDisruptionBudgetsStore)
  am.registerStore(ResourceQuotasStore)
  am.registerStore(SecretsStore)
  am.registerStore(CrdStore)
  am.registerStore(EventStore)
  am.registerStore(NamespaceStore)
  am.registerStore(EndpointStore)
  am.registerStore(IngressStore)
  am.registerStore(NetworkPolicyStore)
  am.registerStore(ServiceStore)
  am.registerStore(NodesStore)
  am.registerStore(PodSecurityPoliciesStore)
  am.registerStore(StorageClassStore)
  am.registerStore(PersistentVolumeClaimStore)
  am.registerStore(PersistentVolumesStore)
  am.registerStore(ServiceAccountsStore)
  am.registerStore(CronJobStore)
  am.registerStore(DaemonSetStore)
  am.registerStore(DeploymentStore)
  am.registerStore(JobStore)
  am.registerStore(PodsStore)
  am.registerStore(ReplicaSetStore)
  am.registerStore(StatefulSetStore)
  am.registerStore(RolesStore, [roleApi, clusterRoleApi])
  am.registerStore(RoleBindingsStore, [roleBindingApi, clusterRoleBindingApi])
  am.registerStore(ClusterObjectStore);
}
