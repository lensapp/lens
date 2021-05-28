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

import "./daemonset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import type { KubeObjectDetailsProps } from "../kube-object";
import type { DaemonSet } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../main/cluster";

interface Props extends KubeObjectDetailsProps<DaemonSet> {
}

@observer
export class DaemonSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    daemonSetStore.reset();
  });

  componentDidMount() {
    podsStore.reloadAll();
  }

  componentWillUnmount() {
    daemonSetStore.reset();
  }

  render() {
    const { object: daemonSet } = this.props;

    if (!daemonSet) return null;
    const { spec } = daemonSet;
    const selectors = daemonSet.getSelectors();
    const images = daemonSet.getImages();
    const nodeSelector = daemonSet.getNodeSelectors();
    const childPods = daemonSetStore.getChildPods(daemonSet);
    const metrics = daemonSetStore.metrics;
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.DaemonSet);

    return (
      <div className="DaemonSetDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => daemonSetStore.loadMetrics(daemonSet)}
            tabs={podMetricTabs} object={daemonSet} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={daemonSet}/>
        {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (<Badge key={label} label={label}/>))
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
        <DrawerItem name="Strategy Type">
          {spec.updateStrategy.type}
        </DrawerItem>
        <PodDetailsTolerations workload={daemonSet}/>
        <PodDetailsAffinities workload={daemonSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={daemonSet}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "DaemonSet",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <DaemonSetDetails {...props} />
  }
});
kubeObjectDetailRegistry.add({
  kind: "DaemonSet",
  apiVersions: ["apps/v1"],
  priority: 5,
  components: {
    Details: (props: any) => <KubeEventDetails {...props} />
  }
});
