/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ServiceAccountMenu } from "../../../+user-management/+service-accounts/service-account-menu";
import { CronJobMenu } from "../../../+workloads-cronjobs/cron-job-menu";
import { DeploymentMenu } from "../../../+workloads-deployments/deployment-menu";
import { ReplicaSetMenu } from "../../../+workloads-replicasets/replica-set-menu";
import { StatefulSetMenu } from "../../../+workloads-statefulsets/stateful-set-menu";
import type { KubeObjectMenuRegistration } from "./kube-object-menu-registration";

export const staticKubeObjectMenuItems = [
  {
    kind: "ServiceAccount",
    apiVersions: ["v1"],
    components: {
      MenuItem: ServiceAccountMenu,
    },
  },
  {
    kind: "CronJob",
    apiVersions: ["batch/v1beta1"],
    components: {
      MenuItem: CronJobMenu,
    },
  },
  {
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    components: {
      MenuItem: DeploymentMenu,
    },
  },
  {
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    components: {
      MenuItem: ReplicaSetMenu,
    },
  },
  {
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    components: {
      MenuItem: StatefulSetMenu,
    },
  },
] as KubeObjectMenuRegistration[];
