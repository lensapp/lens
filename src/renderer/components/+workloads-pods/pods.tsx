import "./pods.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { podsStore } from "./pods.store";
import { RouteComponentProps } from "react-router";
import { volumeClaimStore } from "../+storage-volume-claims/volume-claim.store";
import { IPodsRouteParams } from "../+workloads";
import { eventStore } from "../+events/event.store";
import { getDetailsUrl, KubeObjectListLayout } from "../kube-object";
import { nodesApi, Pod } from "../../api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, stopPropagation } from "../../utils";
import toPairs from "lodash/toPairs";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import { lookupApiLink } from "../../api/kube-api";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";

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

interface Props extends RouteComponentProps<IPodsRouteParams> {
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
                tableView: true
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
              ))
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
        dependentStores={[volumeClaimStore, eventStore]}
        tableId = "workloads_pods"
        isConfigurable
        sortingCallbacks={{
          [columnId.name]: (pod: Pod) => pod.getName(),
          [columnId.namespace]: (pod: Pod) => pod.getNs(),
          [columnId.containers]: (pod: Pod) => pod.getContainers().length,
          [columnId.restarts]: (pod: Pod) => pod.getRestartsCount(),
          [columnId.owners]: (pod: Pod) => pod.getOwnerRefs().map(ref => ref.kind),
          [columnId.qos]: (pod: Pod) => pod.getQosClass(),
          [columnId.node]: (pod: Pod) => pod.getNodeName(),
          [columnId.age]: (pod: Pod) => pod.metadata.creationTimestamp,
          [columnId.status]: (pod: Pod) => pod.getStatusMessage(),
        }}
        searchFilters={[
          (pod: Pod) => pod.getSearchFields(),
          (pod: Pod) => pod.getStatusMessage(),
          (pod: Pod) => pod.status.podIP,
          (pod: Pod) => pod.getNodeName(),
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
        renderTableContents={(pod: Pod) => [
          <Badge flat key="name" label={pod.getName()} tooltip={pod.getName()} />,
          <KubeObjectStatusIcon key="icon" object={pod} />,
          pod.getNs(),
          this.renderContainersStatus(pod),
          pod.getRestartsCount(),
          pod.getOwnerRefs().map(ref => {
            const { kind, name } = ref;
            const detailsLink = getDetailsUrl(lookupApiLink(ref, pod));

            return (
              <Badge flat key={name} className="owner" tooltip={name}>
                <Link to={detailsLink} onClick={stopPropagation}>
                  {kind}
                </Link>
              </Badge>
            );
          }),
          pod.getNodeName() ?
            <Badge flat key="node" className="node" tooltip={pod.getNodeName()}>
              <Link to={getDetailsUrl(nodesApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
                {pod.getNodeName()}
              </Link>
            </Badge>
            : "",
          pod.getQosClass(),
          pod.getAge(),
          { title: pod.getStatusMessage(), className: kebabCase(pod.getStatusMessage()) }
        ]}
      />
    );
  }
}
