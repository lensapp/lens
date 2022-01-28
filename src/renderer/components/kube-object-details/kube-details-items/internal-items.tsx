/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubeObjectDetailsProps } from "..";
import { type HpaDetailsProps, HpaDetails } from "../../+autoscalers";
import { LimitRangeDetails } from "../../+limit-ranges";
import { ConfigMapDetails } from "../../+config-maps";
import { PodDisruptionBudgetDetails } from "../../+pod-disruption-budgets";
import { ResourceQuotaDetails } from "../../+resource-quotas";
import { SecretDetails } from "../../+secrets";
import { CustomResourceDefinitionDetails } from "../../+custom-resource";
import { EventDetails } from "../../+events";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { NamespaceDetails } from "../../+namespaces";
import { EndpointDetails } from "../../+endpoints";
import { IngressDetails } from "../../+ingresses";
import { NetworkPolicyDetails } from "../../+network-policies";
import { ServiceDetails } from "../../+services";
import { NodeDetails } from "../../+nodes";
import { PodSecurityPolicyDetails } from "../../+pod-security-policies";
import { StorageClassDetails } from "../../+storage-classes";
import { PersistentVolumeClaimDetails } from "../../+persistent-volume-claims";
import { PersistentVolumeDetails } from "../../+persistent-volumes";
import { ClusterRoleBindingDetails } from "../../+cluster-role-bindings";
import { ClusterRoleDetails } from "../../+cluster-roles";
import { RoleBindingDetails } from "../../+role-bindings";
import { RoleDetails } from "../../+roles";
import { ServiceAccountsDetails } from "../../+service-accounts";
import { CronJobDetails } from "../../+cronjobs";
import { DaemonSetDetails } from "../../+daemonsets";
import { DeploymentDetails } from "../../+deployments";
import { JobDetails } from "../../+jobs";
import { PodDetails } from "../../+pods";
import { ReplicaSetDetails } from "../../+replica-sets";
import { StatefulSetDetails } from "../../+stateful-sets";
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
      Details: CustomResourceDefinitionDetails,
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
