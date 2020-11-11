import "./node-details.scss";

import React from "react";
import upperFirst from "lodash/upperFirst";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { Badge } from "../badge";
import { nodesStore } from "./nodes.store";
import { ResourceMetrics } from "../resource-metrics";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { Node } from "../../api/endpoints";
import { NodeCharts } from "./node-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { KubeEventDetails } from "../+events/kube-event-details";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Node> {
}

@observer
export class NodeDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object.getName(), () => {
    nodesStore.nodeMetrics = null;
  });

  async componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    nodesStore.nodeMetrics = null;
  }

  render() {
    const { object: node } = this.props;
    if (!node) return;
    const { status } = node
    const { nodeInfo, addresses, capacity, allocatable } = status
    const conditions = node.getActiveConditions();
    const taints = node.getTaints()
    const childPods = podsStore.getPodsByNode(node.getName())
    const metrics = nodesStore.nodeMetrics
    const metricTabs = [
      <Trans>CPU</Trans>,
      <Trans>Memory</Trans>,
      <Trans>Disk</Trans>,
      <Trans>Pods</Trans>,
    ];
    return (
      <div className="NodeDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => nodesStore.loadMetrics(node.getName())}
            tabs={metricTabs} object={node} params={{ metrics }}
          >
            <NodeCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={node} hideFields={["labels", "annotations", "uid", "resourceVersion", "selfLink"]}/>
        <DrawerItem name={<Trans>Capacity</Trans>}>
          <Trans>CPU</Trans>: {capacity.cpu},{" "}
          <Trans>Memory</Trans>: {Math.floor(parseInt(capacity.memory) / 1024)}Mi,{" "}
          <Trans>Pods</Trans>: {capacity.pods}
        </DrawerItem>
        <DrawerItem name={<Trans>Allocatable</Trans>}>
          <Trans>CPU</Trans>: {allocatable.cpu},{" "}
          <Trans>Memory</Trans>: {Math.floor(parseInt(allocatable.memory) / 1024)}Mi,{" "}
          <Trans>Pods</Trans>: {allocatable.pods}
        </DrawerItem>
        {addresses &&
        <DrawerItem name={<Trans>Addresses</Trans>}>
          {
            addresses.map(({ type, address }) => (
              <p key={type}>{type}: {address}</p>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name={<Trans>OS</Trans>}>
          {nodeInfo.operatingSystem} ({nodeInfo.architecture})
        </DrawerItem>
        <DrawerItem name={<Trans>OS Image</Trans>}>
          {nodeInfo.osImage}
        </DrawerItem>
        <DrawerItem name={<Trans>Kernel version</Trans>}>
          {nodeInfo.kernelVersion}
        </DrawerItem>
        <DrawerItem name={<Trans>Container runtime</Trans>}>
          {nodeInfo.containerRuntimeVersion}
        </DrawerItem>
        <DrawerItem name={<Trans>Kubelet version</Trans>}>
          {nodeInfo.kubeletVersion}
        </DrawerItem>
        <DrawerItemLabels
          name={<Trans>Labels</Trans>}
          labels={node.getLabels()}
        />
        <DrawerItemLabels
          name={<Trans>Annotations</Trans>}
          labels={node.getAnnotations()}
        />
        {taints.length > 0 && (
          <DrawerItem name={<Trans>Taints</Trans>} labelsOnly>
            {
              taints.map(({ key, effect, value }) => (
                <Badge key={key} label={key + ": " + effect} tooltip={value}/>
              ))
            }
          </DrawerItem>
        )}
        {conditions &&
        <DrawerItem name={<Trans>Conditions</Trans>} className="conditions" labelsOnly>
          {
            conditions.map(condition => {
              const { type } = condition
              return (
                <Badge
                  key={type}
                  label={type}
                  className={kebabCase(type)}
                  tooltip={{
                    formatters: {
                      tableView: true,
                    },
                    children: Object.entries(condition).map(([key, value]) =>
                      <div key={key} className="flex gaps align-center">
                        <div className="name">{upperFirst(key)}</div>
                        <div className="value">{value}</div>
                      </div>
                    )
                  }}
                />
              )
            })
          }
        </DrawerItem>
        }
        <PodDetailsList
          pods={childPods}
          owner={node}
          maxCpu={node.getCpuCapacity()}
          maxMemory={node.getMemoryCapacity()}
        />
        <KubeEventDetails object={node}/>
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "Node",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <NodeDetails {...props} />
  }
})
