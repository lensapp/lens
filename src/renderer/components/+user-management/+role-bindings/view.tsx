/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { RoleBindingDialog } from "./dialog";
import { roleBindingStore } from "./legacy-store";
import { roleStore } from "../+roles/legacy-store";
import { clusterRoleStore } from "../+cluster-roles/legacy-store";
import { serviceAccountStore } from "../+service-accounts/legacy-store";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

@observer
export class RoleBindings extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_role_bindings"
          className="RoleBindings"
          store={roleBindingStore}
          dependentStores={[roleStore, clusterRoleStore, serviceAccountStore]}
          sortingCallbacks={{
            [columnId.name]: binding => binding.getName(),
            [columnId.namespace]: binding => binding.getNs(),
            [columnId.bindings]: binding => binding.getSubjectNames(),
            [columnId.age]: binding => -binding.getCreationTimestamp(),
          }}
          searchFilters={[
            binding => binding.getSearchFields(),
            binding => binding.getSubjectNames(),
          ]}
          renderHeaderTitle="Role Bindings"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Bindings", className: "bindings", sortBy: columnId.bindings, id: columnId.bindings },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={binding => [
            binding.getName(),
            <KubeObjectStatusIcon key="icon" object={binding} />,
            binding.getNs(),
            binding.getSubjectNames(),
            <KubeObjectAge key="age" object={binding} />,
          ]}
          addRemoveButtons={{
            onAdd: () => RoleBindingDialog.open(),
            addTooltip: "Create new RoleBinding",
          }}
        />
        <RoleBindingDialog />
      </SiblingsInTabLayout>
    );
  }
}
