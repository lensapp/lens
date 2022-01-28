/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespaces.scss";

import React from "react";
import { NamespaceStatus } from "../../../common/k8s-api/endpoints";
import { AddNamespaceDialog } from "./add-dialog";
import { Badge } from "../badge";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { NamespacesRouteParams } from "../../../common/routes";
import type { NamespaceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";
import { observer } from "mobx-react";
import openAddNamespaceDialogInjectable from "./add-dialog-open.injectable";

enum columnId {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

export interface NamespacesProps extends RouteComponentProps<NamespacesRouteParams> {
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  openAddNamespaceDialog: () => void;
}

const NonInjectedNamespaces = observer(({ namespaceStore, openAddNamespaceDialog }: Dependencies & NamespacesProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="namespaces"
      className="Namespaces"
      store={namespaceStore}
      sortingCallbacks={{
        [columnId.name]: ns => ns.getName(),
        [columnId.labels]: ns => ns.getLabels(),
        [columnId.age]: ns => ns.getTimeDiffFromNow(),
        [columnId.status]: ns => ns.getStatus(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
        item => item.getStatus(),
      ]}
      renderHeaderTitle="Namespaces"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Labels", className: "labels scrollable", sortBy: columnId.labels, id: columnId.labels },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
      ]}
      renderTableContents={item => [
        item.getName(),
        <KubeObjectStatusIcon key="icon" object={item} />,
        item.getLabels().map(label => <Badge scrollable key={label} label={label}/>),
        item.getAge(),
        { title: item.getStatus(), className: item.getStatus().toLowerCase() },
      ]}
      addRemoveButtons={{
        addTooltip: "Add Namespace",
        onAdd: openAddNamespaceDialog,
      }}
      customizeTableRowProps={item => ({
        disabled: item.getStatus() === NamespaceStatus.TERMINATING,
      })}
    />
    <AddNamespaceDialog/>
  </>
));

export const Namespaces = withInjectables<Dependencies, NamespacesProps>(NonInjectedNamespaces, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    openAddNamespaceDialog: di.inject(openAddNamespaceDialogInjectable),
    ...props,
  }),
});

