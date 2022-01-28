/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectMenuRegistry } from "../../extensions/registries";
import { ServiceAccountMenu } from "../components/+service-accounts/item-menu";
import { CronJobMenu } from "../components/+cronjobs/item-menu";
import { DeploymentMenu } from "../components/+deployments/item-menu";
import { ReplicaSetMenu } from "../components/+replica-sets/item-menu";
import { StatefulSetMenu } from "../components/+stateful-sets/item-menu";

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
