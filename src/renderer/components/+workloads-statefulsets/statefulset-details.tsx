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

import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { makeObservable, observable, reaction } from "mobx";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import type { KubeObjectDetailsProps } from "../kube-object";
import { getMetricsForStatefulSets, IPodMetrics, StatefulSet } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../main/cluster";
import { boundMethod } from "../../utils";

interface Props extends KubeObjectDetailsProps<StatefulSet> {
}

@observer
export class StatefulSetDetails extends React.Component<Props> {
  @observable metrics: IPodMetrics = null;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    this.metrics = null;
  });

  componentDidMount() {
    podsStore.reloadAll();
  }

  @boundMethod
  async loadMetrics() {
    const { object: statefulSet } = this.props;

    this.metrics = await getMetricsForStatefulSets([statefulSet], statefulSet.getNs(), "");
  }

  render() {
    const { object: statefulSet } = this.props;

    if (!statefulSet) return null;
    const images = statefulSet.getImages();
    const selectors = statefulSet.getSelectors();
    const nodeSelector = statefulSet.getNodeSelectors();
    const childPods = statefulSetStore.getChildPods(statefulSet);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.StatefulSet);

    return (
      <div className="StatefulSetDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => this.loadMetrics}
            tabs={podMetricTabs} object={statefulSet} params={{ metrics: this.metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={statefulSet}/>
        {selectors.length &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        <PodDetailsTolerations workload={statefulSet}/>
        <PodDetailsAffinities workload={statefulSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={this.metrics}/>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
      </div>
    );
  }
}
