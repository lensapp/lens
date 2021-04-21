import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment } from "../../api/endpoints";
import { cssNames } from "../../utils";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { deploymentStore } from "./deployments.store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";
import { ClusterStore } from "../../../common/cluster-store";

interface Props extends KubeObjectDetailsProps<Deployment> {
}

@observer
export class DeploymentDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    deploymentStore.reset();
  });

  componentDidMount() {
    podsStore.reloadAll();
  }

  componentWillUnmount() {
    deploymentStore.reset();
  }

  render() {
    const { object: deployment } = this.props;

    if (!deployment) return null;
    const { status, spec } = deployment;
    const nodeSelector = deployment.getNodeSelectors();
    const selectors = deployment.getSelectors();
    const childPods = deploymentStore.getChildPods(deployment);
    const metrics = deploymentStore.metrics;
    const isMetricHidden = ClusterStore.getInstance().isMetricHidden(ResourceType.Deployment);

    return (
      <div className="DeploymentDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => deploymentStore.loadMetrics(deployment)}
            tabs={podMetricTabs} object={deployment} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={deployment}/>
        <DrawerItem name="Replicas">
          {`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`},{" "}
          {`${status.replicas || 0} total, ${status.availableReplicas || 0} available`},{" "}
          {`${status.unavailableReplicas || 0} unavailable`}
        </DrawerItem>
        {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector">
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name="Strategy Type">
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {
            deployment.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition;

              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" }, kebabCase(type))}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p>Last transition time: {lastTransitionTime}</p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <PodDetailsTolerations workload={deployment}/>
        <PodDetailsAffinities workload={deployment}/>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Deployment",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <DeploymentDetails {...props} />
  }
});
kubeObjectDetailRegistry.add({
  kind: "Deployment",
  apiVersions: ["apps/v1"],
  priority: 5,
  components: {
    Details: (props: any) => <KubeEventDetails {...props} />
  }
});
