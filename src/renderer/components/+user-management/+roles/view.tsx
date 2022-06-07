/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { AddRoleDialog } from "./add-dialog";
import { roleStore } from "./legacy-store";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

@observer
export class Roles extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_roles"
          className="Roles"
          store={roleStore}
          sortingCallbacks={{
            [columnId.name]: role => role.getName(),
            [columnId.namespace]: role => role.getNs(),
            [columnId.age]: role => -role.getCreationTimestamp(),
          }}
          searchFilters={[
            role => role.getSearchFields(),
          ]}
          renderHeaderTitle="Roles"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={role => [
            role.getName(),
            <KubeObjectStatusIcon key="icon" object={role} />,
            role.getNs(),
            <KubeObjectAge key="age" object={role} />,
          ]}
          addRemoveButtons={{
            onAdd: () => AddRoleDialog.open(),
            addTooltip: "Create new Role",
          }}
        />
        <AddRoleDialog/>
      </SiblingsInTabLayout>
    );
  }
}
