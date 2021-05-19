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

import "./overview.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { OverviewStatuses } from "./overview-statuses";
import type { RouteComponentProps } from "react-router";
import { Events } from "../+events";
import { KubeWatchApi } from "../../api/kube-watch-api";
import type { WorkloadsOverviewRouteParams } from "../../../common/routes";
import { getHostedCluster } from "../../../common/cluster-store";
import type { Cluster } from "../../../main/cluster";
import { selectedNamespaces } from "../context";
import { cronJobApi, daemonSetApi, deploymentApi, eventApi, jobApi, podsApi, replicaSetApi, statefulSetApi } from "../../api/endpoints";

interface Props extends RouteComponentProps<WorkloadsOverviewRouteParams> {
}

@observer
export class WorkloadsOverview extends React.Component<Props> {
  cluster: Cluster;

  componentDidMount() {
    this.cluster = getHostedCluster();
    disposeOnUnmount(this, [
      KubeWatchApi.getInstance()
        .subscribeApis([
          podsApi, deploymentApi, daemonSetApi, statefulSetApi, replicaSetApi,
          jobApi, cronJobApi, eventApi,
        ], {
          preload: true,
          namespaces: selectedNamespaces(),
        }),
    ]);
  }

  render() {
    return (
      <div className="WorkloadsOverview flex column gaps">
        <OverviewStatuses cluster={this.cluster}/>
        {this.cluster.isAllowedResource("events") && <Events compact hideFilters className="box grow"/>}
      </div>
    );
  }
}
