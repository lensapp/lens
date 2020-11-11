import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment, deploymentApi } from "../../api/endpoints";
import { cssNames } from "../../utils";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { _i18n } from "../../i18n";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { deploymentStore } from "./deployments.store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { ReplicaSets } from "../+workloads-replicasets";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Deployment> {
}

@observer
export class DeploymentDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    deploymentStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
    if (!replicaSetStore.isLoaded) {
      replicaSetStore.loadAll();
    }
  }

  componentWillUnmount() {
    deploymentStore.reset();
  }

  render() {
    const { object: deployment } = this.props;
    if (!deployment) return null
    const { status, spec } = deployment
    const nodeSelector = deployment.getNodeSelectors()
    const selectors = deployment.getSelectors();
    const childPods = deploymentStore.getChildPods(deployment)
    const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment)
    const metrics = deploymentStore.metrics
    return (
      <div className="DeploymentDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => deploymentStore.loadMetrics(deployment)}
            tabs={podMetricTabs} object={deployment} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={deployment}/>
        <DrawerItem name={<Trans>Replicas</Trans>}>
          {_i18n._(t`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`)},{" "}
          {_i18n._(t`${status.replicas || 0} total, ${status.availableReplicas || 0} available`)},{" "}
          {_i18n._(t`${status.unavailableReplicas || 0} unavailable`)}
        </DrawerItem>
        {selectors.length > 0 &&
        <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name={<Trans>Node Selector</Trans>}>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name={<Trans>Strategy Type</Trans>}>
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem name={<Trans>Conditions</Trans>} className="conditions" labelsOnly>
          {
            deployment.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition
              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" }, kebabCase(type))}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p><Trans>Last transition time: {lastTransitionTime}</Trans></p>
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
        <ReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
        <KubeEventDetails object={deployment}/>
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "Deployment",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <DeploymentDetails {...props} />
  }
})
