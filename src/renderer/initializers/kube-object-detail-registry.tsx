/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { KubeObjectDetailRegistry } from "../api/kube-object-detail-registry";
import type { HpaDetailsProps } from "../components/+config-autoscalers";
import { HpaDetails } from "../components/+config-autoscalers";
import { LimitRangeDetails } from "../components/+config-limit-ranges";
import { ConfigMapDetails } from "../components/+config-maps";
import { PodDisruptionBudgetDetails } from "../components/+config-pod-disruption-budgets";
import { ResourceQuotaDetails } from "../components/+config-resource-quotas";
import { SecretDetails } from "../components/+config-secrets";
import { CRDDetails } from "../components/+custom-resources";
import { EventDetails } from "../components/+events";
import { KubeEventDetails } from "../components/+events/kube-event-details";
import { NamespaceDetails } from "../components/+namespaces";
import { EndpointsDetails } from "../components/+network-endpoints";
import { IngressDetails } from "../components/+network-ingresses";
import { NetworkPolicyDetails } from "../components/+network-policies";
import { ServiceDetails } from "../components/+network-services";
import { NodeDetails } from "../components/+nodes/details";
import { PodSecurityPolicyDetails } from "../components/+pod-security-policies";
import { StorageClassDetails } from "../components/+storage-classes";
import { PersistentVolumeClaimDetails } from "../components/+storage-volume-claims";
import { PersistentVolumeDetails } from "../components/+storage-volumes";
import { ClusterRoleDetails } from "../components/+user-management/+cluster-roles";
import { ClusterRoleBindingDetails } from "../components/+user-management/+cluster-role-bindings";
import { RoleDetails } from "../components/+user-management/+roles";
import { RoleBindingDetails } from "../components/+user-management/+role-bindings";
import { ServiceAccountsDetails } from "../components/+user-management/+service-accounts";
import { CronJobDetails } from "../components/+workloads-cronjobs";
import { DaemonSetDetails } from "../components/+workloads-daemonsets";
import { DeploymentDetails } from "../components/+workloads-deployments";
import { JobDetails } from "../components/+workloads-jobs";
import { PodDetails } from "../components/+workloads-pods";
import { ReplicaSetDetails } from "../components/+workloads-replicasets";
import { StatefulSetDetails } from "../components/+workloads-statefulsets";
import type { KubeObjectDetailsProps } from "../components/kube-object-details";

export function initKubeObjectDetailRegistry() {
  const registry = KubeObjectDetailRegistry.getInstance();

  registry.add({
    kind: "HorizontalPodAutoscaler",
    apiVersions: ["autoscaling/v2beta1"],
    components: {
      // Note: this line is left in the long form as a validation that this usecase is valid
      Details: (props: HpaDetailsProps) => <HpaDetails {...props}/>,
    },
  });
  registry.add({
    kind: "HorizontalPodAutoscaler",
    apiVersions: ["autoscaling/v2beta1"],
    components: {
      // Note: this line is left in the long form as a validation that this usecase is valid
      Details: (props: HpaDetailsProps) => <HpaDetails {...props}/>,
    },
  });
  registry.add({
    kind: "HorizontalPodAutoscaler",
    apiVersions: ["autoscaling/v2beta1"],
    priority: 5,
    components: {
      // Note: this line is left in the long form as a validation that this usecase is valid
      Details: (props: KubeObjectDetailsProps) => <KubeEventDetails {...props}/>,
    },
  });
  registry.add({
    kind: "LimitRange",
    apiVersions: ["v1"],
    components: {
      Details: LimitRangeDetails,
    },
  });
  registry.add({
    kind: "ConfigMap",
    apiVersions: ["v1"],
    components: {
      Details: ConfigMapDetails,
    },
  });
  registry.add({
    kind: "ConfigMap",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "PodDisruptionBudget",
    apiVersions: ["policy/v1beta1"],
    components: {
      Details: PodDisruptionBudgetDetails,
    },
  });
  registry.add({
    kind: "ResourceQuota",
    apiVersions: ["v1"],
    components: {
      Details: ResourceQuotaDetails,
    },
  });
  registry.add({
    kind: "Secret",
    apiVersions: ["v1"],
    components: {
      Details: SecretDetails,
    },
  });
  registry.add({
    kind: "CustomResourceDefinition",
    apiVersions: ["apiextensions.k8s.io/v1", "apiextensions.k8s.io/v1beta1"],
    components: {
      Details: CRDDetails,
    },
  });
  registry.add({
    kind: "Event",
    apiVersions: ["v1"],
    components: {
      Details: EventDetails,
    },
  });
  registry.add({
    kind: "Namespace",
    apiVersions: ["v1"],
    components: {
      Details: NamespaceDetails,
    },
  });
  registry.add({
    kind: "Endpoints",
    apiVersions: ["v1"],
    components: {
      Details: EndpointsDetails,
    },
  });
  registry.add({
    kind: "Endpoints",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Ingress",
    apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
    components: {
      Details: IngressDetails,
    },
  });
  registry.add({
    kind: "Ingress",
    apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "NetworkPolicy",
    apiVersions: ["networking.k8s.io/v1"],
    components: {
      Details: NetworkPolicyDetails,
    },
  });
  registry.add({
    kind: "NetworkPolicy",
    apiVersions: ["networking.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Service",
    apiVersions: ["v1"],
    components: {
      Details: ServiceDetails,
    },
  });
  registry.add({
    kind: "Service",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Node",
    apiVersions: ["v1"],
    components: {
      Details: NodeDetails,
    },
  });
  registry.add({
    kind: "Node",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "PodSecurityPolicy",
    apiVersions: ["policy/v1beta1"],
    components: {
      Details: PodSecurityPolicyDetails,
    },
  });
  registry.add({
    kind: "StorageClass",
    apiVersions: ["storage.k8s.io/v1"],
    components: {
      Details: StorageClassDetails,
    },
  });
  registry.add({
    kind: "StorageClass",
    apiVersions: ["storage.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "PersistentVolumeClaim",
    apiVersions: ["v1"],
    components: {
      Details: PersistentVolumeClaimDetails,
    },
  });
  registry.add({
    kind: "PersistentVolumeClaim",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "PersistentVolume",
    apiVersions: ["v1"],
    components: {
      Details: PersistentVolumeDetails,
    },
  });
  registry.add({
    kind: "PersistentVolume",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Role",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: RoleDetails,
    },
  });
  registry.add({
    kind: "Role",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "ClusterRole",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: ClusterRoleDetails,
    },
  });
  registry.add({
    kind: "ClusterRole",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "RoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: RoleBindingDetails,
    },
  });
  registry.add({
    kind: "RoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "ClusterRoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    components: {
      Details: ClusterRoleBindingDetails,
    },
  });
  registry.add({
    kind: "ClusterRoleBinding",
    apiVersions: ["rbac.authorization.k8s.io/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "ServiceAccount",
    apiVersions: ["v1"],
    components: {
      Details: ServiceAccountsDetails,
    },
  });
  registry.add({
    kind: "ServiceAccount",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    components: {
      Details: CronJobDetails,
    },
  });
  registry.add({
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "DaemonSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: DaemonSetDetails,
    },
  });
  registry.add({
    kind: "DaemonSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    components: {
      Details: DeploymentDetails,
    },
  });
  registry.add({
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Job",
    apiVersions: ["batch/v1"],
    components: {
      Details: JobDetails,
    },
  });
  registry.add({
    kind: "Job",
    apiVersions: ["batch/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "Pod",
    apiVersions: ["v1"],
    components: {
      Details: PodDetails,
    },
  });
  registry.add({
    kind: "Pod",
    apiVersions: ["v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: ReplicaSetDetails,
    },
  });
  registry.add({
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
  registry.add({
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    components: {
      Details: StatefulSetDetails,
    },
  });
  registry.add({
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    priority: 5,
    components: {
      Details: KubeEventDetails,
    },
  });
}
