import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { StatefulSet } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";
import { ClusterStore } from "../../../common/cluster-store";

interface Props extends KubeObjectDetailsProps<StatefulSet> {
}

@observer
export class StatefulSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    statefulSetStore.reset();
  });

  componentDidMount() {
    podsStore.reloadAll();
  }

  componentWillUnmount() {
    statefulSetStore.reset();
  }

  render() {
    const { object: statefulSet } = this.props;

    if (!statefulSet) return null;
    const images = statefulSet.getImages();
    const selectors = statefulSet.getSelectors();
    const nodeSelector = statefulSet.getNodeSelectors();
    const childPods = statefulSetStore.getChildPods(statefulSet);
    const metrics = statefulSetStore.metrics;
    const isMetricHidden = ClusterStore.getInstance().isMetricHidden(ResourceType.StatefulSet);

    return (
      <div className="StatefulSetDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => statefulSetStore.loadMetrics(statefulSet)}
            tabs={podMetricTabs} object={statefulSet} params={{ metrics }}
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
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
      </div>
    );
  }
}


kubeObjectDetailRegistry.add({
  kind: "StatefulSet",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <StatefulSetDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "StatefulSet",
  apiVersions: ["apps/v1"],
  priority: 5,
  components: {
    Details: (props: any) => <KubeEventDetails {...props} />
  }
});
