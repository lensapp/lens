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
import type * as endpoints from "../api/endpoints";
import type { KubeObject } from "../api/kube-object";
import { KubeObjectDetailRegistry } from "../api/kube-object-detail-registry";
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
import { EndpointDetails } from "../components/+network-endpoints";
import { IngressDetails } from "../components/+network-ingresses";
import { NetworkPolicyDetails } from "../components/+network-policies";
import { ServiceDetails } from "../components/+network-services";
import { NodeDetails } from "../components/+nodes";
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

export function intiKubeObjectDetailRegistry() {
  KubeObjectDetailRegistry.getInstance()
    .add([
      {
        kind: "HorizontalPodAutoscaler",
        apiVersions: ["autoscaling/v2beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.HorizontalPodAutoscaler>) => <HpaDetails {...props}/>,
        }
      },
      {
        kind: "HorizontalPodAutoscaler",
        apiVersions: ["autoscaling/v2beta1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "LimitRange",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.LimitRange>) => <LimitRangeDetails {...props}/>,
        }
      },
      {
        kind: "ConfigMap",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ConfigMap>) => <ConfigMapDetails {...props}/>,
        }
      },
      {
        kind: "ConfigMap",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "PodDisruptionBudget",
        apiVersions: ["policy/v1beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.PodDisruptionBudget>) => <PodDisruptionBudgetDetails {...props}/>,
        }
      },
      {
        kind: "ResourceQuota",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ResourceQuota>) => <ResourceQuotaDetails {...props}/>,
        }
      },
      {
        kind: "Secret",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Secret>) => <SecretDetails {...props}/>,
        }
      },
      {
        kind: "CustomResourceDefinition",
        apiVersions: ["apiextensions.k8s.io/v1", "apiextensions.k8s.io/v1beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.CustomResourceDefinition>) => <CRDDetails {...props}/>,
        }
      },
      {
        kind: "Event",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.KubeEvent>) => <EventDetails {...props}/>,
        }
      },
      {
        kind: "Namespace",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Namespace>) => <NamespaceDetails {...props}/>,
        }
      },
      {
        kind: "Endpoints",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Endpoint>) => <EndpointDetails {...props}/>,
        }
      },
      {
        kind: "Endpoints",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Ingress",
        apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Ingress>) => <IngressDetails {...props}/>,
        }
      },
      {
        kind: "Ingress",
        apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "NetworkPolicy",
        apiVersions: ["networking.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.NetworkPolicy>) => <NetworkPolicyDetails {...props}/>,
        }
      },
      {
        kind: "NetworkPolicy",
        apiVersions: ["networking.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Service",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Service>) => <ServiceDetails {...props}/>,
        }
      },
      {
        kind: "Service",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Node",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Node>) => <NodeDetails {...props}/>,
        }
      },
      {
        kind: "Node",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "PodSecurityPolicy",
        apiVersions: ["policy/v1beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.PodSecurityPolicy>) => <PodSecurityPolicyDetails {...props}/>,
        }
      },
      {
        kind: "StorageClass",
        apiVersions: ["storage.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.StorageClass>) => <StorageClassDetails {...props}/>,
        }
      },
      {
        kind: "StorageClass",
        apiVersions: ["storage.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "PersistentVolumeClaim",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.PersistentVolumeClaim>) => <PersistentVolumeClaimDetails {...props}/>,
        }
      },
      {
        kind: "PersistentVolumeClaim",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "PersistentVolume",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.PersistentVolume>) => <PersistentVolumeDetails {...props}/>,
        }
      },
      {
        kind: "PersistentVolume",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Role",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Role>) => <RoleDetails {...props}/>,
        }
      },
      {
        kind: "Role",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "ClusterRole",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ClusterRole>) => <ClusterRoleDetails {...props}/>,
        }
      },
      {
        kind: "ClusterRole",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "RoleBinding",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.RoleBinding>) => <RoleBindingDetails {...props}/>,
        }
      },
      {
        kind: "RoleBinding",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "ClusterRoleBinding",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ClusterRoleBinding>) => <ClusterRoleBindingDetails {...props}/>,
        }
      },
      {
        kind: "ClusterRoleBinding",
        apiVersions: ["rbac.authorization.k8s.io/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "ServiceAccount",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ServiceAccount>) => <ServiceAccountsDetails {...props}/>,
        }
      },
      {
        kind: "ServiceAccount",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "CronJob",
        apiVersions: ["batch/v1beta1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.CronJob>) => <CronJobDetails {...props}/>,
        }
      },
      {
        kind: "CronJob",
        apiVersions: ["batch/v1beta1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "DaemonSet",
        apiVersions: ["apps/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.DaemonSet>) => <DaemonSetDetails {...props}/>,
        }
      },
      {
        kind: "DaemonSet",
        apiVersions: ["apps/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Deployment",
        apiVersions: ["apps/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Deployment>) => <DeploymentDetails {...props}/>,
        }
      },
      {
        kind: "Deployment",
        apiVersions: ["apps/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Job",
        apiVersions: ["batch/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Job>) => <JobDetails {...props}/>,
        }
      },
      {
        kind: "Job",
        apiVersions: ["batch/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.Pod>) => <PodDetails {...props}/>,
        }
      },
      {
        kind: "Pod",
        apiVersions: ["v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "ReplicaSet",
        apiVersions: ["apps/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.ReplicaSet>) => <ReplicaSetDetails {...props}/>,
        }
      },
      {
        kind: "ReplicaSet",
        apiVersions: ["apps/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      },
      {
        kind: "StatefulSet",
        apiVersions: ["apps/v1"],
        components: {
          Details: (props: KubeObjectDetailsProps<endpoints.StatefulSet>) => <StatefulSetDetails {...props}/>,
        }
      },
      {
        kind: "StatefulSet",
        apiVersions: ["apps/v1"],
        priority: 5,
        components: {
          Details: (props: KubeObjectDetailsProps<KubeObject>) => <KubeEventDetails {...props}/>,
        }
      }
    ]);
}
