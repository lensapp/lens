/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespaces.scss";

import React from "react";
import { NamespaceStatusKind } from "../../../common/k8s-api/endpoints";
import { AddNamespaceDialog } from "./add-dialog/dialog";
import { TabLayout } from "../layout/tab-layout-2";
import { Badge } from "../badge";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NamespaceStore } from "./store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";
import { KubeObjectAge } from "../kube-object/age";
import openAddNamepaceDialogInjectable from "./add-dialog/open.injectable";

enum columnId {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  openAddNamespaceDialog: () => void;
}

export const NonInjectedNamespacesRoute = ({ namespaceStore, openAddNamespaceDialog }: Dependencies) => (
  <TabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="namespaces"
      className="Namespaces"
      store={namespaceStore}
      sortingCallbacks={{
        [columnId.name]: namespace => namespace.getName(),
        [columnId.labels]: namespace => namespace.getLabels(),
        [columnId.age]: namespace => -namespace.getCreationTimestamp(),
        [columnId.status]: namespace => namespace.getStatus(),
      }}
      searchFilters={[
        namespace => namespace.getSearchFields(),
        namespace => namespace.getStatus(),
      ]}
      renderHeaderTitle="Namespaces"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Labels", className: "labels scrollable", sortBy: columnId.labels, id: columnId.labels },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
      ]}
      renderTableContents={namespace => [
        namespace.getName(),
        <KubeObjectStatusIcon key="icon" object={namespace} />,
        namespace.getLabels().map(label => (
          <Badge
            scrollable
            key={label}
            label={label}
          />
        )),
        <KubeObjectAge key="age" object={namespace} />,
        { title: namespace.getStatus(), className: namespace.getStatus().toLowerCase() },
      ]}
      addRemoveButtons={{
        addTooltip: "Add Namespace",
        onAdd: openAddNamespaceDialog,
      }}
      customizeTableRowProps={item => ({
        disabled: item.getStatus() === NamespaceStatusKind.TERMINATING,
      })}
    />
    <AddNamespaceDialog/>
  </TabLayout>
);


export const NamespacesRoute = withInjectables<Dependencies>(NonInjectedNamespacesRoute, {
  getProps: (di) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    openAddNamespaceDialog: di.inject(openAddNamepaceDialogInjectable),
  }),
});
