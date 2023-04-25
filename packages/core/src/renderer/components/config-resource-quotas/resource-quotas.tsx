/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-quotas.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { AddQuotaDialog } from "./add-dialog/view";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { ResourceQuotaStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaStoreInjectable from "./store.injectable";
import openAddQuotaDialogInjectable from "./add-dialog/open.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  resourceQuotaStore: ResourceQuotaStore;
  openAddQuotaDialog: () => void;
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
            <NamespaceSelectBadge
              key="namespace"
              namespace={resourceQuota.getNs()}
            />,
            <KubeObjectAge key="age" object={resourceQuota} />,
          ]}
          addRemoveButtons={{
            onAdd: this.props.openAddQuotaDialog,
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
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
    openAddQuotaDialog: di.inject(openAddQuotaDialogInjectable),
  }),
});
