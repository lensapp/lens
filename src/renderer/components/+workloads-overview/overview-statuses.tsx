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
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import type { KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../utils/rbac";
import { workloadURL } from "../../../common/routes";
import type { Cluster } from "../../../main/cluster";
import type { NamespaceStore } from "../+namespaces";
import { ApiManager } from "../../api/api-manager";
import { cronJobApi, daemonSetApi, deploymentApi, jobApi, namespacesApi, podsApi, replicaSetApi, statefulSetApi } from "../../api/endpoints";
import type { KubeApi } from "../../api/kube-api";

const resources: [KubeResource, KubeApi][] = [
  ["pods", podsApi],
  ["deployments", deploymentApi],
  ["statefulsets", statefulSetApi],
  ["daemonsets", daemonSetApi],
  ["replicasets", replicaSetApi],
  ["jobs", jobApi],
  ["cronjobs", cronJobApi],
];

@observer
export class OverviewStatuses extends React.Component<{ cluster: Cluster }> {
  private get namespaceStore() {
    return ApiManager.getInstance().getStore<NamespaceStore>(namespacesApi);
  }

  renderWorkload(resource: KubeResource, api: KubeApi): React.ReactElement {
    const store = ApiManager.getInstance().getStore(api);
    const items = store.getAllByNs(this.namespaceStore.contextNamespaces);

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
    const workloads = resources
      .filter(([kind]) => this.props.cluster.isAllowedResource(kind))
      .map(([resource, api]) => this.renderWorkload(resource, api));

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
