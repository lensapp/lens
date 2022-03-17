/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pods.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { podsStore } from "./pods.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { nodeApi } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, getConvertedParts, object, stopPropagation } from "../../utils";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import { getDetailsUrl } from "../kube-detail-params";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

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

@observer
export class Pods extends React.Component {
  renderState<T extends string>(name: string, ready: boolean, key: string, data: Partial<Record<T, string | number>> | undefined) {
    return data && (
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
          <div key={name} className="flex gaps align-center">
            <div className="name">
              {startCase(name)}
            </div>
            <div className="value">
              {value}
            </div>
          </div>
        ))}
      </>
    );
  }

  renderContainersStatus(pod: Pod) {
    return pod.getContainerStatuses()
      .map(({ name, state = {}, ready }) => (
        <Fragment key={name}>
          <StatusBrick
            className={cssNames(state, { ready })}
            tooltip={{
              formatters: {
                tableView: true,
              },
              children: (
                <>
                  {this.renderState(name, ready, "running", state.running)}
                  {this.renderState(name, ready, "waiting", state.waiting)}
                  {this.renderState(name, ready, "terminated", state.terminated)}
                </>
              ),
            }} 
          />
        </Fragment>
      ));
  }

  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          className="Pods"
          store={podsStore}
          dependentStores={[eventStore]} // status icon component uses event store
          tableId = "workloads_pods"
          isConfigurable
          sortingCallbacks={{
            [columnId.name]: pod => getConvertedParts(pod.getName()),
            [columnId.namespace]: pod => pod.getNs(),
            [columnId.containers]: pod => pod.getContainers().length,
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
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Containers", className: "containers", sortBy: columnId.containers, id: columnId.containers },
            { title: "Restarts", className: "restarts", sortBy: columnId.restarts, id: columnId.restarts },
            { title: "Controlled By", className: "owners", sortBy: columnId.owners, id: columnId.owners },
            { title: "Node", className: "node", sortBy: columnId.node, id: columnId.node },
            { title: "QoS", className: "qos", sortBy: columnId.qos, id: columnId.qos },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={pod => [
            <Badge
              flat
              key="name"
              label={pod.getName()}
              tooltip={pod.getName()}
              expandable={false} 
            />,
            <KubeObjectStatusIcon key="icon" object={pod} />,
            pod.getNs(),
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
                <Link to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
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
