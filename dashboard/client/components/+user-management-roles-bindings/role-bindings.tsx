import "./role-bindings.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { RoleBindingsRouteParams } from "../+user-management/user-management.routes";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { clusterRoleBindingApi, RoleBinding, roleBindingApi } from "../../api/endpoints";
import { roleBindingsStore } from "./role-bindings.store";
import { KubeObjectListLayout } from "../kube-object";
import { AddRoleBindingDialog } from "./add-role-binding-dialog";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

interface Props extends RouteComponentProps<RoleBindingsRouteParams> {
}

@observer
export class RoleBindings extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="RoleBindings"
        store={roleBindingsStore}
        sortingCallbacks={{
          [sortBy.name]: (binding: RoleBinding): string => binding.getName(),
          [sortBy.namespace]: (binding: RoleBinding): string => binding.getNs(),
          [sortBy.bindings]: (binding: RoleBinding): string => binding.getSubjectNames(),
          [sortBy.age]: (binding: RoleBinding): string => binding.metadata.creationTimestamp,
        }}
        searchFilters={[
          (binding: RoleBinding): string[] => binding.getSearchFields(),
          (binding: RoleBinding): string => binding.getSubjectNames(),
        ]}
        renderHeaderTitle={<Trans>Role Bindings</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Bindings</Trans>, className: "bindings", sortBy: sortBy.bindings },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(binding: RoleBinding): (string | number)[] => [
          binding.getName(),
          binding.getSubjectNames(),
          binding.getNs() || "-",
          binding.getAge(),
        ]}
        renderItemMenu={(item: RoleBinding): JSX.Element => {
          return <RoleBindingMenu object={item}/>;
        }}
        addRemoveButtons={{
          onAdd: (): void => AddRoleBindingDialog.open(),
          addTooltip: <Trans>Create new RoleBinding</Trans>,
        }}
      />
    );
  }
}

export function RoleBindingMenu(props: KubeObjectMenuProps<RoleBinding>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews([roleBindingApi, clusterRoleBindingApi], {
  Menu: RoleBindingMenu,
});
