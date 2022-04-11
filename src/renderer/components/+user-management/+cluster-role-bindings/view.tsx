/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { ClusterRoleBindingDialog } from "./dialog";
import { clusterRoleBindingStore } from "./legacy-store";
import { clusterRolesStore } from "../+cluster-roles/store";
import { serviceAccountsStore } from "../+service-accounts/store";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

@observer
export class ClusterRoleBindings extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_cluster_role_bindings"
          className="ClusterRoleBindings"
          store={clusterRoleBindingStore}
          dependentStores={[clusterRolesStore, serviceAccountsStore]}
          sortingCallbacks={{
            [columnId.name]: binding => binding.getName(),
            [columnId.bindings]: binding => binding.getSubjectNames(),
            [columnId.age]: binding => -binding.getCreationTimestamp(),
          }}
          searchFilters={[
            binding => binding.getSearchFields(),
            binding => binding.getSubjectNames(),
          ]}
          renderHeaderTitle="Cluster Role Bindings"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Bindings", className: "bindings", sortBy: columnId.bindings, id: columnId.bindings },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={binding => [
            binding.getName(),
            <KubeObjectStatusIcon key="icon" object={binding} />,
            binding.getSubjectNames(),
            <KubeObjectAge key="age" object={binding} />,
          ]}
          addRemoveButtons={{
            onAdd: () => ClusterRoleBindingDialog.open(),
            addTooltip: "Create new ClusterRoleBinding",
          }}
        />
        <ClusterRoleBindingDialog />
      </SiblingsInTabLayout>
    );
  }
}
