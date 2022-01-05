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

import React from "react";
import type { KubeObjectDetailsProps } from "..";
import { type HpaDetailsProps, HpaDetails } from "../../+config-autoscalers";
import { LimitRangeDetails } from "../../+config-limit-ranges";
import { ConfigMapDetails } from "../../+config-maps";
import { PodDisruptionBudgetDetails } from "../../+config-pod-disruption-budgets";
import { ResourceQuotaDetails } from "../../+config-resource-quotas";
import { SecretDetails } from "../../+config-secrets";
import { CRDDetails } from "../../+custom-resources";
import { EventDetails } from "../../+events";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { NamespaceDetails } from "../../+namespaces";
import { EndpointDetails } from "../../+network-endpoints";
import { IngressDetails } from "../../+network-ingresses";
import { NetworkPolicyDetails } from "../../+network-policies";
import { ServiceDetails } from "../../+network-services";
import { NodeDetails } from "../../+nodes";
import { PodSecurityPolicyDetails } from "../../+pod-security-policies";
import { StorageClassDetails } from "../../+storage-classes";
import { PersistentVolumeClaimDetails } from "../../+storage-volume-claims";
import { PersistentVolumeDetails } from "../../+storage-volumes";
import { ClusterRoleBindingDetails } from "../../+user-management/+cluster-role-bindings";
import { ClusterRoleDetails } from "../../+user-management/+cluster-roles";
import { RoleBindingDetails } from "../../+user-management/+role-bindings";
import { RoleDetails } from "../../+user-management/+roles";
import { ServiceAccountsDetails } from "../../+user-management/+service-accounts";
import { CronJobDetails } from "../../+workloads-cronjobs";
import { DaemonSetDetails } from "../../+workloads-daemonsets";
import { DeploymentDetails } from "../../+workloads-deployments";
import { JobDetails } from "../../+workloads-jobs";
import { PodDetails } from "../../+workloads-pods";
import { ReplicaSetDetails } from "../../+workloads-replicasets";
import { StatefulSetDetails } from "../../+workloads-statefulsets";
import type { KubeObjectDetailRegistration } from "./kube-detail-items";

export const internalItems: Required<KubeObjectDetailRegistration>[] = [
  {
    kind: "HorizontalPodAutoscaler",
    apiVersions: ["autoscaling/v2beta1"],
    components: {
      // Note: this line is left in the long form as a validation that this usecase is valid
      Details: (props: HpaDetailsProps) => <HpaDetails {...props}/>,
    },
  },
  {
    kind: "HorizontalPodAutoscaler",
    apiVersions: ["autoscaling/v2beta1"],
    priority: 5,
    components: {
      // Note: this line is left in the long form as a validation that this usecase is valid
      Details: (props: KubeObjectDetailsProps) => <KubeEventDetails {...props}/>,
    },
  },
  {
    kind: "LimitRange",
    apiVersions: ["v1"],
    components: {
      Details: LimitRangeDetails,
    },
  },
  {
    kind: "ConfigMap",
    apiVersions: ["v1"],
    components: {
      Details: ConfigMapDetails,
    },
  },
  {
    kind: "ConfigMap",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "PodDisruptionBudget",
    apiVersions: ["policy/v1beta1"],
    components: {
      Details: PodDisruptionBudgetDetails,
    },
  },
  {
    kind: "ResourceQuota",
    apiVersions: ["v1"],
    components: {
      Details: ResourceQuotaDetails,
    },
  },
  {
    kind: "Secret",
    apiVersions: ["v1"],
    components: {
      Details: SecretDetails,
    },
  },
  {
    kind: "CustomResourceDefinition",
    apiVersions: ["apiextensions.k8s.io/v1", "apiextensions.k8s.io/v1beta1"],
    components: {
      Details: CRDDetails,
    },
  },
  {
    kind: "Event",
    apiVersions: ["v1"],
    components: {
      Details: EventDetails,
    },
  },
  {
    kind: "Namespace",
    apiVersions: ["v1"],
    components: {
      Details: NamespaceDetails,
    },
  },
  {
    kind: "Endpoints",
    apiVersions: ["v1"],
    components: {
      Details: EndpointDetails,
    },
  },
  {
    kind: "Endpoints",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Ingress",
    apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
    components: {
      Details: IngressDetails,
    },
  },
  {
    kind: "Ingress",
    apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "NetworkPolicy",
    apiVersions: ["networking.k8s.io/v1"],
    components: {
      Details: NetworkPolicyDetails,
    },
  },
  {
    kind: "NetworkPolicy",
    apiVersions: ["networking.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Service",
    apiVersions: ["v1"],
    components: {
      Details: ServiceDetails,
    },
  },
  {
    kind: "Service",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Node",
    apiVersions: ["v1"],
    components: {
      Details: NodeDetails,
    },
  },
  {
    kind: "Node",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "PodSecurityPolicy",
    apiVersions: ["policy/v1beta1"],
    components: {
      Details: PodSecurityPolicyDetails,
    },
  },
  {
    kind: "StorageClass",
    apiVersions: ["storage.k8s.io/v1"],
    components: {
      Details: StorageClassDetails,
    },
  },
  {
    kind: "StorageClass",
    apiVersions: ["storage.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "PersistentVolumeClaim",
    apiVersions: ["v1"],
    components: {
      Details: PersistentVolumeClaimDetails,
    },
  },
  {
    kind: "PersistentVolumeClaim",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "PersistentVolume",
    apiVersions: ["v1"],
    components: {
      Details: PersistentVolumeDetails,
    },
  },
  {
    kind: "PersistentVolume",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Role",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: RoleDetails,
    },
  },
  {
    kind: "Role",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "ClusterRole",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: ClusterRoleDetails,
    },
  },
  {
    kind: "ClusterRole",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "RoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: RoleBindingDetails,
    },
  },
  {
    kind: "RoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "ClusterRoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: ClusterRoleBindingDetails,
    },
  },
  {
    kind: "ClusterRoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "ServiceAccount",
    apiVersions: ["v1"],
    components: {
      Details: ServiceAccountsDetails,
    },
  },
  {
    kind: "ServiceAccount",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    components: {
      Details: CronJobDetails,
    },
  },
  {
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "DaemonSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: DaemonSetDetails,
    },
  },
  {
    kind: "DaemonSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    components: {
      Details: DeploymentDetails,
    },
  },
  {
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Job",
    apiVersions: ["batch/v1"],
    components: {
      Details: JobDetails,
    },
  },
  {
    kind: "Job",
    apiVersions: ["batch/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "Pod",
    apiVersions: ["v1"],
    components: {
      Details: PodDetails,
    },
  },
  {
    kind: "Pod",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: ReplicaSetDetails,
    },
  },
  {
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
  {
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: StatefulSetDetails,
    },
  },
  {
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  },
].map(({ priority = 50, ...item }) => ({ priority, ...item }));
