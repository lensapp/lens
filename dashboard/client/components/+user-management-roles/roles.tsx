import "./roles.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { RolesRouteParams } from "../+user-management/user-management.routes";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { rolesStore } from "./roles.store";
import { clusterRoleApi, Role, roleApi } from "../../api/endpoints";
import { KubeObjectListLayout } from "../kube-object";
import { AddRoleDialog } from "./add-role-dialog";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<RolesRouteParams> {
}

@observer
export class Roles extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <>
        <KubeObjectListLayout
          className="Roles"
          store={rolesStore}
          sortingCallbacks={{
            [sortBy.name]: (role: Role): string => role.getName(),
            [sortBy.namespace]: (role: Role): string => role.getNs(),
            [sortBy.age]: (role: Role): string => role.metadata.creationTimestamp,
          }}
          searchFilters={[
            (role: Role): string[] => role.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Roles</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(role: Role): (string | number)[] => [
            role.getName(),
            role.getNs() || "-",
            role.getAge(),
          ]}
          renderItemMenu={(item: Role): JSX.Element => {
            return <RoleMenu object={item}/>;
          }}
          addRemoveButtons={{
            onAdd: (): void => AddRoleDialog.open(),
            addTooltip: <Trans>Create new Role</Trans>,
          }}
        />
        <AddRoleDialog/>
      </>
    );
  }
}

export function RoleMenu(props: KubeObjectMenuProps<Role>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews([roleApi, clusterRoleApi], {
  Menu: RoleMenu,
});
