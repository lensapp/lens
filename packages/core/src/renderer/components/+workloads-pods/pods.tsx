/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pods.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { ContainerStateValues, NodeApi, Pod } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, getConvertedParts, object, stopPropagation } from "@k8slens/utilities";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { EventStore } from "../+events/store";
import type { PodStore } from "./store";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import podStoreInjectable from "./store.injectable";
import { NamespaceSelectBadge } from "../+namespaces/namespace-select-badge";
import { Tooltip } from "../tooltip";

enum columnId {
  name = "name",
  namespace = "namespace",
  containers = "containers",
  restarts = "restarts",
  age = "age",
  qos = "qos",
  node = "node",
  owners = "owners",
  status = "status",
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
  eventStore: EventStore;
  podStore: PodStore;
  nodeApi: NodeApi;
}

@observer
class NonInjectedPods extends React.Component<Dependencies> {
  renderState(name: string, ready: boolean, key: string, data?: ContainerStateValues) {
    if (!data) {
      return;
    }

    return (
      <>
        <div className="title">
          {name}
          {" "}
          <span className="text-secondary">
            {key}
            {ready ? ", ready" : ""}
          </span>
        </div>
        {object.entries(data).map(([name, value]) => (
          <React.Fragment key={name}>
            <div className="name">{startCase(name)}</div>
            <div className="value">{value}</div>
          </React.Fragment>
        ))}
      </>
    );
  }

  renderContainersStatus(pod: Pod) {
    return pod.getContainerStatuses().map(({ name, state, ready }) => {
      return (
        <StatusBrick
          key={name}
          className={cssNames(state, { ready })}
          tooltip={{
            formatters: {
              tableView: true,
              nowrap: true,
            },
            children: (
              <>
                {this.renderState(name, ready, "running", state?.running)}
                {this.renderState(name, ready, "waiting", state?.waiting)}
                {this.renderState(name, ready, "terminated", state?.terminated)}
              </>
            ),
          }}
        />
      );
    });
  }

  render() {
    const { apiManager, getDetailsUrl, podStore, eventStore, nodeApi } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          className="Pods"
          store={podStore}
          dependentStores={[eventStore]} // status icon component uses event store
          tableId="workloads_pods"
          isConfigurable
          sortingCallbacks={{
            [columnId.name]: pod => getConvertedParts(pod.getName()),
            [columnId.namespace]: pod => pod.getNs(),
            [columnId.containers]: pod => pod.getContainerStatuses().length,
            [columnId.restarts]: pod => pod.getRestartsCount(),
            [columnId.owners]: pod => pod.getOwnerRefs().map(ref => ref.kind),
            [columnId.qos]: pod => pod.getQosClass(),
            [columnId.node]: pod => pod.getNodeName(),
            [columnId.age]: pod => -pod.getCreationTimestamp(),
            [columnId.status]: pod => pod.getStatusMessage(),
          }}
          searchFilters={[
            pod => pod.getSearchFields(),
            pod => pod.getStatusMessage(),
            pod => pod.status?.podIP,
            pod => pod.getNodeName(),
          ]}
          renderHeaderTitle="Pods"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            {
              title: "Namespace",
              className: "namespace",
              sortBy: columnId.namespace,
              id: columnId.namespace,
            },
            {
              title: "Containers",
              className: "containers",
              sortBy: columnId.containers,
              id: columnId.containers,
            },
            {
              title: "Restarts",
              className: "restarts",
              sortBy: columnId.restarts,
              id: columnId.restarts,
            },
            {
              title: "Controlled By",
              className: "owners",
              sortBy: columnId.owners,
              id: columnId.owners,
            },
            { title: "Node", className: "node", sortBy: columnId.node, id: columnId.node },
            { title: "QoS", className: "qos", sortBy: columnId.qos, id: columnId.qos },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={pod => [
            <>
              <span id={`list-pod-${pod.getId()}`}>
                {pod.getName()}
              </span>
              <Tooltip targetId={`list-pod-${pod.getId()}`}>
                {pod.getName()}
              </Tooltip>
            </>,
            <KubeObjectStatusIcon key="icon" object={pod} />,
            <NamespaceSelectBadge
              key="namespace"
              namespace={pod.getNs()}
            />,
            this.renderContainersStatus(pod),
            pod.getRestartsCount(),
            pod.getOwnerRefs().map(ref => {
              const { kind, name } = ref;
              const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

              return (
                <Badge
                  flat
                  key={name}
                  className="owner"
                  tooltip={name}
                >
                  <Link to={detailsLink} onClick={stopPropagation}>
                    {kind}
                  </Link>
                </Badge>
              );
            }),
            pod.getNodeName() ? (
              <Badge
                flat
                key="node"
                className="node"
                tooltip={pod.getNodeName()}
                expandable={false}
              >
                <Link
                  to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))}
                  onClick={stopPropagation}>
                  {pod.getNodeName()}
                </Link>
              </Badge>
            )
              : "",
            pod.getQosClass(),
            <KubeObjectAge key="age" object={pod} />,
            { title: pod.getStatusMessage(), className: kebabCase(pod.getStatusMessage()) },
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Pods = withInjectables<Dependencies>(NonInjectedPods, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    nodeApi: di.inject(nodeApiInjectable),
    eventStore: di.inject(eventStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
