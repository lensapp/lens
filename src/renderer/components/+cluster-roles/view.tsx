/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { AddClusterRoleDialog } from "./add-dialog";
import type { ClusterRoleStore } from "./store";
import type { ClusterRolesRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleStoreInjectable from "./store.injectable";
import openAddClusterRoleDialogInjectable from "./open-add-dialog.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface ClusterRolesProps extends RouteComponentProps<ClusterRolesRouteParams> {
}

interface Dependencies {
  clusterRoleStore: ClusterRoleStore;
  openAddClusterRoleDialog: () => void;
}

const NonInjectedClusterRoles = observer(({ clusterRoleStore, openAddClusterRoleDialog }: Dependencies & ClusterRolesProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="access_cluster_roles"
      className="ClusterRoles"
      store={clusterRoleStore}
      sortingCallbacks={{
        [columnId.name]: clusterRole => clusterRole.getName(),
        [columnId.age]: clusterRole => clusterRole.getTimeDiffFromNow(),
      }}
      searchFilters={[
        clusterRole => clusterRole.getSearchFields(),
      ]}
      renderHeaderTitle="Cluster Roles"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={clusterRole => [
        clusterRole.getName(),
        <KubeObjectStatusIcon key="icon" object={clusterRole} />,
        clusterRole.getAge(),
      ]}
      addRemoveButtons={{
        onAdd: openAddClusterRoleDialog,
        addTooltip: "Create new ClusterRole",
      }}
    />
    <AddClusterRoleDialog/>
  </>
));

export const ClusterRoles = withInjectables<Dependencies, ClusterRolesProps>(NonInjectedClusterRoles, {
  getProps: (di, props) => ({
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    openAddClusterRoleDialog: di.inject(openAddClusterRoleDialogInjectable),
    ...props,
  }),
});

