/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./ingresses.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import type { IngressStore } from "./store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { IngressRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import ingressStoreInjectable from "./store.injectables";

enum columnId {
  name = "name",
  namespace = "namespace",
  loadBalancers ="load-balancers",
  rules = "rules",
  age = "age",
}

export interface IngressesProps extends RouteComponentProps<IngressRouteParams> {
}

interface Dependencies {
  ingressStore: IngressStore;
}

const NonInjectedIngresses = observer(({ ingressStore }: Dependencies & IngressesProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="network_ingresses"
    className="Ingresses"
    store={ingressStore}
    sortingCallbacks={{
      [columnId.name]: ingress => ingress.getName(),
      [columnId.namespace]: ingress => ingress.getNs(),
      [columnId.age]: ingress => ingress.getTimeDiffFromNow(),
    }}
    searchFilters={[
      ingress => ingress.getSearchFields(),
      ingress => ingress.getPorts(),
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
    renderTableContents={ingress => [
      ingress.getName(),
      <KubeObjectStatusIcon key="icon" object={ingress} />,
      ingress.getNs(),
      ingress.getLoadBalancers().map(lb => <p key={lb}>{lb}</p>),
      ingress.getRoutes().map(route => <p key={route}>{route}</p>),
      ingress.getAge(),
    ]}
    tableProps={{
      customRowHeights: (item, lineHeight, paddings) => {
        const lines = item.getRoutes().length || 1;

        return lines * lineHeight + paddings;
      },
    }}
  />
));

export const Ingresses = withInjectables<Dependencies, IngressesProps>(NonInjectedIngresses, {
  getProps: (di, props) => ({
    ingressStore: di.inject(ingressStoreInjectable),
    ...props,
  }),
});

