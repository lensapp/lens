/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoints.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { prevDefault } from "../../utils";
import type { EndpointsStore } from "./store";
import type { FilterByNamespace } from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import endpointsStoreInjectable from "./store.injectable";
import filterByNamespaceInjectable from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  endpoints = "endpoints",
  age = "age",
}

interface Dependencies {
  endpointsStore: EndpointsStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedEndpoints extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="network_endpoints"
          className="Endpoints"
          store={this.props.endpointsStore}
          sortingCallbacks={{
            [columnId.name]: endpoint => endpoint.getName(),
            [columnId.namespace]: endpoint => endpoint.getNs(),
            [columnId.age]: endpoint => -endpoint.getCreationTimestamp(),
          }}
          searchFilters={[
            endpoint => endpoint.getSearchFields(),
          ]}
          renderHeaderTitle="Endpoints"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Endpoints", className: "endpoints", id: columnId.endpoints },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={endpoint => [
            endpoint.getName(),
            <KubeObjectStatusIcon key="icon" object={endpoint} />,
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => this.props.filterByNamespace(endpoint.getNs()))}
            >
              {endpoint.getNs()}
            </a>,
            endpoint.toString(),
            <KubeObjectAge key="age" object={endpoint} />,
          ]}
          tableProps={{
            customRowHeights: (item, lineHeight, paddings) => {
              const lines = item.getEndpointSubsets().length || 1;

              return lines * lineHeight + paddings;
            },
          }}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Endpoints = withInjectables<Dependencies>(NonInjectedEndpoints, {
  getProps: (di, props) => ({
    ...props,
    endpointsStore: di.inject(endpointsStoreInjectable),
    filterByNamespace: di.inject(filterByNamespaceInjectable),
  }),
});
