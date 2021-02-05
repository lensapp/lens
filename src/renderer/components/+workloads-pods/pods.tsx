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


enum sortBy {
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
          [sortBy.name]: (pod: Pod) => pod.getName(),
          [sortBy.namespace]: (pod: Pod) => pod.getNs(),
          [sortBy.containers]: (pod: Pod) => pod.getContainers().length,
          [sortBy.restarts]: (pod: Pod) => pod.getRestartsCount(),
          [sortBy.owners]: (pod: Pod) => pod.getOwnerRefs().map(ref => ref.kind),
          [sortBy.qos]: (pod: Pod) => pod.getQosClass(),
          [sortBy.node]: (pod: Pod) => pod.getNodeName(),
          [sortBy.age]: (pod: Pod) => pod.metadata.creationTimestamp,
          [sortBy.status]: (pod: Pod) => pod.getStatusMessage(),
        }}
        searchFilters={[
          (pod: Pod) => pod.getSearchFields(),
          (pod: Pod) => pod.getStatusMessage(),
          (pod: Pod) => pod.status.podIP,
          (pod: Pod) => pod.getNodeName(),
        ]}
        renderHeaderTitle="Pods"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning", showWithColumn: "name" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Containers", className: "containers", sortBy: sortBy.containers },
          { title: "Restarts", className: "restarts", sortBy: sortBy.restarts },
          { title: "Controlled By", className: "owners", sortBy: sortBy.owners },
          { title: "Node", className: "node", sortBy: sortBy.node },
          { title: "QoS", className: "qos", sortBy: sortBy.qos },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Status", className: "status", sortBy: sortBy.status },
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
