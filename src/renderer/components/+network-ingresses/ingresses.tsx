import "./ingresses.scss"

import React from "react"
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom"
import { IngressRouteParams } from "./ingresses.route"
import { Ingress, ingressApi } from "../../api/endpoints/ingress.api"
import { ingressStore } from "./ingress.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { Trans } from "@lingui/macro";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<IngressRouteParams> {
}

@observer
export class Ingresses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="Ingresses" store={ingressStore}
        sortingCallbacks={{
          [sortBy.name]: (ingress: Ingress) => ingress.getName(),
          [sortBy.namespace]: (ingress: Ingress) => ingress.getNs(),
          [sortBy.age]: (ingress: Ingress) => ingress.metadata.creationTimestamp,
        }}
        searchFilters={[
          (ingress: Ingress) => ingress.getSearchFields(),
          (ingress: Ingress) => ingress.getPorts(),
        ]}
        renderHeaderTitle={<Trans>Ingresses</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>LoadBalancers</Trans>, className: "loadbalancers" },
          { title: <Trans>Rules</Trans>, className: "rules" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(ingress: Ingress) => [
          ingress.getName(),
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
    )
  }
}
