/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pods.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import type { RouteComponentProps } from "react-router";
import type { EventStore } from "../+events/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NodeApi, Pod } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, getConvertedParts, stopPropagation } from "../../utils";
import toPairs from "lodash/toPairs";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import type { PodsRouteParams } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { PodsStore } from "../../../extensions/renderer-api/k8s-api";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import podStoreInjectable from "./store.injectable";
import eventStoreInjectable from "../+events/store.injectable";

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

export interface PodsProps extends RouteComponentProps<PodsRouteParams> {
}

interface Dependencies {
  apiManager: ApiManager;
  podStore: PodsStore;
  eventStore: EventStore;
  nodeApi: NodeApi;
}

const NonInjectedPods = observer(({ apiManager, podStore, eventStore, nodeApi }: Dependencies & PodsProps) => {
  const renderContainersStatus = (pod: Pod) => (
    pod.getContainerStatuses()
      .map(({ name, state, ready }) => (
        <Fragment key={name}>
          <StatusBrick
            className={cssNames(state, { ready })}
            tooltip={{
              formatters: {
                tableView: true,
              },
              children: Object.keys(state).map((status: keyof typeof state) => (
                <Fragment key={status}>
                  <div className="title">
                    {name} <span className="text-secondary">({status}{ready ? ", ready" : ""})</span>
                  </div>
                  {toPairs(state[status]).map(([name, value]) => (
                    <div key={name} className="flex gaps align-center">
                      <div className="name">{startCase(name)}</div>
                      <div className="value">{value}</div>
                    </div>
                  ))}
                </Fragment>
              )),
            }}
          />
        </Fragment>
      ))
  );

  return (
    <KubeObjectListLayout
      className="Pods"
      store={podStore}
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
        [columnId.age]: pod => pod.getTimeDiffFromNow(),
        [columnId.status]: pod => pod.getStatusMessage(),
      }}
      searchFilters={[
        pod => pod.getSearchFields(),
        pod => pod.getStatusMessage(),
        pod => pod.status.podIP,
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
        <Badge flat key="name" label={pod.getName()} tooltip={pod.getName()} expandable={false} />,
        <KubeObjectStatusIcon key="icon" object={pod} />,
        pod.getNs(),
        renderContainersStatus(pod),
        pod.getRestartsCount(),
        pod.getOwnerRefs().map(ref => {
          const { kind, name } = ref;
          const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

          return (
            <Badge flat key={name} className="owner" tooltip={name}>
              <Link to={detailsLink} onClick={stopPropagation}>
                {kind}
              </Link>
            </Badge>
          );
        }),
        pod.getNodeName() ?
          <Badge flat key="node" className="node" tooltip={pod.getNodeName()} expandable={false}>
            <Link to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
              {pod.getNodeName()}
            </Link>
          </Badge>
          : "",
        pod.getQosClass(),
        pod.getAge(),
        { title: pod.getStatusMessage(), className: kebabCase(pod.getStatusMessage()) },
      ]}
    />
  );
});

export const Pods = withInjectables<Dependencies, PodsProps>(NonInjectedPods, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeApi: di.inject(nodeApiInjectable),
    ...props,
  }),
});

