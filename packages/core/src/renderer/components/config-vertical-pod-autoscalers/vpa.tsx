/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./vpa.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { cssNames, prevDefault } from "@k8slens/utilities";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { VerticalPodAutoscalerStore } from "./store";
import type { FilterByNamespace } from "../namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import filterByNamespaceInjectable from "../namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import verticalPodAutoscalerStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  mode = "mode",
  age = "age",
  status = "status",
}

interface Dependencies {
  verticalPodAutoscalerStore: VerticalPodAutoscalerStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedVerticalPodAutoscalers extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_vpa"
          className="VerticalPodAutoscalers"
          store={this.props.verticalPodAutoscalerStore}
          sortingCallbacks={{
            [columnId.name]: vpa => vpa.getName(),
            [columnId.namespace]: vpa => vpa.getNs(),
            [columnId.age]: vpa => -vpa.getCreationTimestamp(),
          }}
          searchFilters={[
            vpa => vpa.getSearchFields(),
          ]}
          renderHeaderTitle="Vertical Pod Autoscalers"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Mode", className: "mode", sortBy: columnId.mode, id: columnId.mode },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status scrollable", id: columnId.status },
          ]}
          renderTableContents={vpa => [
            vpa.getName(),
            <KubeObjectStatusIcon key="icon" object={vpa} />,
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => this.props.filterByNamespace(vpa.getNs()))}
            >
              {vpa.getNs()}
            </a>,
            vpa.getMode(),
            <KubeObjectAge key="age" object={vpa} />,
            vpa.getConditions()
              .filter(({ isReady }) => isReady)
              .map(({ type, tooltip }) => (
                <Badge
                  key={type}
                  label={type}
                  tooltip={tooltip}
                  className={cssNames(type.toLowerCase())}
                  expandable={false}
                  scrollable={true}
                />
              )),
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const VerticalPodAutoscalers = withInjectables<Dependencies>(NonInjectedVerticalPodAutoscalers, {
  getProps: (di, props) => ({
    ...props,
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    verticalPodAutoscalerStore: di.inject(verticalPodAutoscalerStoreInjectable),
  }),
});
