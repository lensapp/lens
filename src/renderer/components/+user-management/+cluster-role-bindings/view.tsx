/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { ClusterRoleBindingDialog } from "./dialog";
import { clusterRoleBindingsStore } from "./store";
import { clusterRolesStore } from "../+cluster-roles/store";
import { serviceAccountsStore } from "../+service-accounts/store";
import type { ClusterRoleBindingsRouteParams } from "../../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

interface Props extends RouteComponentProps<ClusterRoleBindingsRouteParams> {
}

@observer
export class ClusterRoleBindings extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_cluster_role_bindings"
          className="ClusterRoleBindings"
          store={clusterRoleBindingsStore}
          dependentStores={[clusterRolesStore, serviceAccountsStore]}
          sortingCallbacks={{
            [columnId.name]: binding => binding.getName(),
            [columnId.bindings]: binding => binding.getSubjectNames(),
            [columnId.age]: binding => binding.getTimeDiffFromNow(),
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
            binding.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => ClusterRoleBindingDialog.open(),
            addTooltip: "Create new ClusterRoleBinding",
          }}
        />
        <ClusterRoleBindingDialog />
      </>
    );
  }
}
