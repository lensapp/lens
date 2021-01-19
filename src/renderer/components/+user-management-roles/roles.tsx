import "./roles.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { IRolesRouteParams } from "../+user-management/user-management.route";
import { rolesStore } from "./roles.store";
import { Role } from "../../api/endpoints";
import { KubeObjectListLayout } from "../kube-object";
import { AddRoleDialog } from "./add-role-dialog";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<IRolesRouteParams> {
}

@observer
export class Roles extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Roles"
          store={rolesStore}
          sortingCallbacks={{
            [sortBy.name]: (role: Role) => role.getName(),
            [sortBy.namespace]: (role: Role) => role.getNs(),
            [sortBy.age]: (role: Role) => role.metadata.creationTimestamp,
          }}
          searchFilters={[
            (role: Role) => role.getSearchFields(),
          ]}
          renderHeaderTitle="Roles"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Age", className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(role: Role) => [
            role.getName(),
            <KubeObjectStatusIcon key="icon" object={role} />,
            role.getNs() || "-",
            role.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddRoleDialog.open(),
            addTooltip: "Create new Role",
          }}
        />
        <AddRoleDialog/>
      </>
    );
  }
}
