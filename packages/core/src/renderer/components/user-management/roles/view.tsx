/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { AddRoleDialog } from "./add-dialog/view";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import type { RoleStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleStoreInjectable from "./store.injectable";
import openAddRoleDialogInjectable from "./add-dialog/open.injectable";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  roleStore: RoleStore;
  openAddRoleDialog: () => void;
}

@observer
class NonInjectedRoles extends React.Component<Dependencies> {
  render() {
    const {
      roleStore,
      openAddRoleDialog,
    } = this.props;

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
            <NamespaceSelectBadge
              key="namespace"
              namespace={role.getNs()}
            />,
            <KubeObjectAge key="age" object={role} />,
          ]}
          addRemoveButtons={{
            onAdd: () => openAddRoleDialog(),
            addTooltip: "Create new Role",
          }}
        />
        <AddRoleDialog/>
      </SiblingsInTabLayout>
    );
  }
}

export const Roles = withInjectables<Dependencies>(NonInjectedRoles, {
  getProps: (di, props) => ({
    ...props,
    roleStore: di.inject(roleStoreInjectable),
    openAddRoleDialog: di.inject(openAddRoleDialogInjectable),
  }),
});
