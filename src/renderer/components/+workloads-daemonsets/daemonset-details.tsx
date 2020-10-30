import "./daemonset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { DaemonSet } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<DaemonSet> {
}

@observer
export class DaemonSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    daemonSetStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    daemonSetStore.reset();
  }

  render() {
    const { object: daemonSet } = this.props;
    if (!daemonSet) return null;
    const { spec } = daemonSet
    const selectors = daemonSet.getSelectors();
    const images = daemonSet.getImages()
    const nodeSelector = daemonSet.getNodeSelectors()
    const childPods = daemonSetStore.getChildPods(daemonSet)
    const metrics = daemonSetStore.metrics
    return (
      <div className="DaemonSetDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => daemonSetStore.loadMetrics(daemonSet)}
            tabs={podMetricTabs} object={daemonSet} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={daemonSet}/>
        {selectors.length > 0 &&
        <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name={<Trans>Node Selector</Trans>} labelsOnly>
          {
            nodeSelector.map(label => (<Badge key={label} label={label}/>))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name={<Trans>Images</Trans>}>
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        <DrawerItem name={<Trans>Strategy Type</Trans>}>
          {spec.updateStrategy.type}
        </DrawerItem>
        <PodDetailsTolerations workload={daemonSet}/>
        <PodDetailsAffinities workload={daemonSet}/>
        <DrawerItem name={<Trans>Pod Status</Trans>} className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={daemonSet}/>
        <KubeEventDetails object={daemonSet}/>
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "DaemonSet",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <DaemonSetDetails {...props} />
  }
})
