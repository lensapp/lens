import "./ingresses.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { IngressRouteParams } from "./ingresses.route";
import { Ingress } from "../../api/endpoints/ingress.api";
import { ingressStore } from "./ingress.store";
import { KubeObjectListLayout } from "../kube-object";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  loadBalancers ="load-balancers",
  rules = "rules",
  age = "age",
}

interface Props extends RouteComponentProps<IngressRouteParams> {
}

@observer
export class Ingresses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="network_ingresses"
        className="Ingresses" store={ingressStore}
        sortingCallbacks={{
          [columnId.name]: (ingress: Ingress) => ingress.getName(),
          [columnId.namespace]: (ingress: Ingress) => ingress.getNs(),
          [columnId.age]: (ingress: Ingress) => ingress.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (ingress: Ingress) => ingress.getSearchFields(),
          (ingress: Ingress) => ingress.getPorts(),
        ]}
        renderHeaderTitle="Ingresses"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "LoadBalancers", className: "loadbalancers", id: columnId.loadBalancers },
          { title: "Rules", className: "rules", id: columnId.rules },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(ingress: Ingress) => [
          ingress.getName(),
          <KubeObjectStatusIcon key="icon" object={ingress} />,
          ingress.getNs(),
          ingress.getLoadBalancers().map(lb => <p key={lb}>{lb}</p>),
          ingress.getRoutes().map(route => <p key={route}>{route}</p>),
          ingress.getAge(),
        ]}
        tableProps={{
          customRowHeights: (item: Ingress, lineHeight, paddings) => {
            const lines = item.getRoutes().length || 1;

            return lines * lineHeight + paddings;
          }
        }}
      />
    );
  }
}
