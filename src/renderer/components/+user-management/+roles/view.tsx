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
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import type { RoleStore } from "./store";
import { prevDefault } from "../../../utils";
import type { FilterByNamespace } from "../../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import filterByNamespaceInjectable from "../../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import roleStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  roleStore: RoleStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedRoles extends React.Component<Dependencies> {
  render() {
    const {
      filterByNamespace,
      roleStore,
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
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => filterByNamespace(role.getNs()))}
            >
              {role.getNs()}
            </a>,
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

export const Roles = withInjectables<Dependencies>(NonInjectedRoles, {
  getProps: (di, props) => ({
    ...props,
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    roleStore: di.inject(roleStoreInjectable),
  }),
});
