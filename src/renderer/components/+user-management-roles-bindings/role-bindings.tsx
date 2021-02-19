import "./role-bindings.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { IRoleBindingsRouteParams } from "../+user-management/user-management.route";
import { RoleBinding } from "../../api/endpoints";
import { roleBindingsStore } from "./role-bindings.store";
import { KubeObjectListLayout } from "../kube-object";
import { AddRoleBindingDialog } from "./add-role-binding-dialog";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

interface Props extends RouteComponentProps<IRoleBindingsRouteParams> {
}

@observer
export class RoleBindings extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="access_role_bindings"
        className="RoleBindings"
        store={roleBindingsStore}
        sortingCallbacks={{
          [columnId.name]: (binding: RoleBinding) => binding.getName(),
          [columnId.namespace]: (binding: RoleBinding) => binding.getNs(),
          [columnId.bindings]: (binding: RoleBinding) => binding.getSubjectNames(),
          [columnId.age]: (binding: RoleBinding) => binding.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (binding: RoleBinding) => binding.getSearchFields(),
          (binding: RoleBinding) => binding.getSubjectNames(),
        ]}
        renderHeaderTitle="Role Bindings"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Bindings", className: "bindings", sortBy: columnId.bindings, id: columnId.bindings },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(binding: RoleBinding) => [
          binding.getName(),
          <KubeObjectStatusIcon key="icon" object={binding} />,
          binding.getSubjectNames(),
          binding.getNs() || "-",
          binding.getAge(),
        ]}
        addRemoveButtons={{
          onAdd: () => AddRoleBindingDialog.open(),
          addTooltip: "Create new RoleBinding",
        }}
      />
    );
  }
}
