/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-quotas.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { AddQuotaDialog } from "./add-quota-dialog";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { prevDefault } from "../../utils";
import type { ResourceQuotaStore } from "./store";
import type { FilterByNamespace } from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import filterByNamespaceInjectable from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import resourceQuotaStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  resourceQuotaStore: ResourceQuotaStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedResourceQuotas extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_quotas"
          className="ResourceQuotas"
          store={this.props.resourceQuotaStore}
          sortingCallbacks={{
            [columnId.name]: resourceQuota => resourceQuota.getName(),
            [columnId.namespace]: resourceQuota => resourceQuota.getNs(),
            [columnId.age]: resourceQuota => -resourceQuota.getCreationTimestamp(),
          }}
          searchFilters={[
            resourceQuota => resourceQuota.getSearchFields(),
            resourceQuota => resourceQuota.getName(),
          ]}
          renderHeaderTitle="Resource Quotas"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={resourceQuota => [
            resourceQuota.getName(),
            <KubeObjectStatusIcon key="icon" object={resourceQuota}/>,
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => this.props.filterByNamespace(resourceQuota.getNs()))}
            >
              {resourceQuota.getNs()}
            </a>,
            <KubeObjectAge key="age" object={resourceQuota} />,
          ]}
          addRemoveButtons={{
            onAdd: () => AddQuotaDialog.open(),
            addTooltip: "Create new ResourceQuota",
          }}
        />
        <AddQuotaDialog/>
      </SiblingsInTabLayout>
    );
  }
}

export const ResourceQuotas = withInjectables<Dependencies>(NonInjectedResourceQuotas, {
  getProps: (di, props) => ({
    ...props,
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
  }),
});
