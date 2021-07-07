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

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import { namespaceStore } from "../+namespaces/namespace.store";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { isAllowedResource } from "../../api/allowed-resources";
import { boundMethod } from "../../utils";
import { workloadURL } from "../../../common/routes";
import { KubeResource, ResourceNames } from "../../../common/rbac";
import type { KubeObjectStore } from "../../kube-object.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";

const stores: KubeObjectStore[] = [
  podsStore,
  deploymentStore,
  daemonSetStore,
  statefulSetStore,
  replicaSetStore,
  jobStore,
  cronJobStore,
];

@observer
export class OverviewStatuses extends React.Component {
  @boundMethod
  renderWorkload(store: KubeObjectStore): React.ReactElement {
    const items = store.getAllByNs(namespaceStore.contextNamespaces);
    const resource = store.api.apiResource as KubeResource;

    return (
      <div className="workload" key={resource}>
        <div className="title">
          <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
        </div>
        <OverviewWorkloadStatus status={store.getStatuses(items)} />
      </div>
    );
  }

  render() {
    const workloads = stores
      .filter(store => isAllowedResource(store.api))
      .map(this.renderWorkload);

    return (
      <div className="OverviewStatuses">
        <div className="header flex gaps align-center">
          <h5 className="box grow">Overview</h5>
          <NamespaceSelectFilter />
        </div>
        <div className="workloads">
          {workloads}
        </div>
      </div>
    );
  }
}
