/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { AddClusterRoleDialog } from "./add-dialog";
import { clusterRolesStore } from "./legacy-store";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

@observer
export class ClusterRoles extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_cluster_roles"
          className="ClusterRoles"
          store={clusterRolesStore}
          sortingCallbacks={{
            [columnId.name]: clusterRole => clusterRole.getName(),
            [columnId.age]: clusterRole => -clusterRole.getCreationTimestamp(),
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
            <KubeObjectAge key="age" object={clusterRole} />,
          ]}
          addRemoveButtons={{
            onAdd: () => AddClusterRoleDialog.open(),
            addTooltip: "Create new ClusterRole",
          }}
        />
        <AddClusterRoleDialog/>
      </SiblingsInTabLayout>
    );
  }
}
