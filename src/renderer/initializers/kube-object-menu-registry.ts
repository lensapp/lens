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
