/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectMenuRegistry } from "../../extensions/registries";
import { ServiceAccountMenu } from "../components/+user-management/+service-accounts";
import { CronJobMenu } from "../components/+workloads-cronjobs";
import { DeploymentMenu } from "../components/+workloads-deployments";
import { ReplicaSetMenu } from "../components/+workloads-replicasets";
import { StatefulSetMenu } from "../components/+workloads-statefulsets";

export function initKubeObjectMenuRegistry() {
  KubeObjectMenuRegistry.getInstance()
    .add([
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
    ]);
}
