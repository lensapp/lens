/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./ingresses.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { computeRouteDeclarations } from "@k8slens/kube-object";
import type { IngressStore } from "./ingress-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import ingressStoreInjectable from "./ingress-store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  loadBalancers ="load-balancers",
  rules = "rules",
  age = "age",
}

interface Dependencies {
  ingressStore: IngressStore;
}

const NonInjectedIngresses = observer((props: Dependencies) => {
  const {
    ingressStore,
  } = props;

  return (
    <SiblingsInTabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId="network_ingresses"
        className="Ingresses"
        store={ ingressStore }
        sortingCallbacks={ {
          [columnId.name]: ingress => ingress.getName(),
          [columnId.namespace]: ingress => ingress.getNs(),
          [columnId.age]: ingress => -ingress.getCreationTimestamp(),
        } }
        searchFilters={ [
          ingress => ingress.getSearchFields(),
          ingress => ingress.getPorts(),
        ] }
        renderHeaderTitle="Ingresses"
        renderTableHeader={ [
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "LoadBalancers", className: "loadbalancers", id: columnId.loadBalancers },
          { title: "Rules", className: "rules", id: columnId.rules },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ] }
        renderTableContents={ ingress => [
          ingress.getName(),
          <KubeObjectStatusIcon key="icon" object={ ingress } />,
          <NamespaceSelectBadge key="namespace" namespace={ingress.getNs()} />,
          ingress.getLoadBalancers().map(lb => <p key={ lb }>{ lb }</p>),
          computeRouteDeclarations(ingress).map(decl => (
            decl.displayAsLink
              ? (
                <div key={ decl.url } className="ingressRule">
                  <a
                    href={ decl.url }
                    rel="noreferrer"
                    target="_blank"
                    onClick={ e => e.stopPropagation() }
                  >
                    { decl.url }
                  </a>
                  { ` ⇢ ${decl.service}` }
                </div>
              )
              : (
                <div key={ decl.url } className="ingressRule">
                  { `${decl.url} ⇢ ${decl.service}` }
                </div>
              )
          )),
          <KubeObjectAge key="age" object={ ingress } />,
        ] }
        tableProps={ {
          customRowHeights: (item, lineHeight, paddings) => {
            const lines = item.getRoutes().length || 1;

            return lines * lineHeight + paddings;
          },
        } } />
    </SiblingsInTabLayout>
  );
});

export const Ingresses = withInjectables<Dependencies>(NonInjectedIngresses, {
  getProps: (di, props) => ({
    ...props,
    ingressStore: di.inject(ingressStoreInjectable),
  }),
});
