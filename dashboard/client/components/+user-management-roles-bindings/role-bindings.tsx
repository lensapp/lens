import "./role-bindings.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { Icon } from "../icon";
import { IRoleBindingsRouteParams } from "../+user-management/user-management.routes";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { clusterRoleBindingApi, RoleBinding, roleBindingApi } from "../../api/endpoints";
import { roleBindingsStore } from "./role-bindings.store";
import { KubeObjectListLayout } from "../kube-object";
import { AddRoleBindingDialog } from "./add-role-binding-dialog";
import { KubeObject } from "../../api/kube-object";
import { apiManager } from "../../api/api-manager";

enum sortBy {
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
        className="RoleBindings"
        store={roleBindingsStore}
        sortingCallbacks={{
          [sortBy.name]: (binding: RoleBinding) => binding.getName(),
          [sortBy.namespace]: (binding: RoleBinding) => binding.getNs(),
          [sortBy.bindings]: (binding: RoleBinding) => binding.getSubjectNames(),
          [sortBy.age]: (binding: RoleBinding) => binding.getAge(false),
        }}
        searchFilters={[
          (binding: RoleBinding) => binding.getSearchFields(),
          (binding: RoleBinding) => binding.getSubjectNames(),
        ]}
        renderHeaderTitle={<Trans>Role Bindings</Trans>}
        filterItems={[
          (items: RoleBinding[]) => items.filter(KubeObject.isNonSystem),
        ]}
        customizeHeader={({ info }) => ({
          info: (
            <>
              {info}
              <Icon
                small
                material="help_outline"
                className="help-icon"
                tooltip={<Trans>Excluded items with "system:" prefix</Trans>}
              />
            </>
          )
        })}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Bindings</Trans>, className: "bindings", sortBy: sortBy.bindings },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(binding: RoleBinding) => [
          binding.getName(),
          binding.getSubjectNames(),
          binding.getNs() || "-",
          binding.getAge(),
        ]}
        renderItemMenu={(item: RoleBinding) => {
          return <RoleBindingMenu object={item}/>
        }}
        addRemoveButtons={{
          onAdd: () => AddRoleBindingDialog.open(),
          addTooltip: <Trans>Create new RoleBinding</Trans>,
        }}
      />
    )
  }
}

export function RoleBindingMenu(props: KubeObjectMenuProps<RoleBinding>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews([roleBindingApi, clusterRoleBindingApi], {
  Menu: RoleBindingMenu,
})