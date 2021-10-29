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

import "./pods.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { podsStore } from "./pods.store";
import type { RouteComponentProps } from "react-router";
import { eventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { nodesApi, Pod } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, getConvertedParts, stopPropagation } from "../../utils";
import toPairs from "lodash/toPairs";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import type { PodsRouteParams } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";

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

interface Props extends RouteComponentProps<PodsRouteParams> {
}

@observer
export class Pods extends React.Component<Props> {
  renderContainersStatus(pod: Pod) {
    return pod.getContainerStatuses().map(containerStatus => {
      const { name, state, ready } = containerStatus;

      return (
        <Fragment key={name}>
          <StatusBrick
            className={cssNames(state, { ready })}
            tooltip={{
              formatters: {
                tableView: true,
              },
              children: Object.keys(state).map(status => (
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
      );
    });
  }

  render() {
    return (
      <KubeObjectListLayout
        className="Pods" store={podsStore}
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
          this.renderContainersStatus(pod),
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
              <Link to={getDetailsUrl(nodesApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
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
  }
}
