/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { RoleBindingDialog } from "./dialog";
import type { RoleBindingStore } from "./store";
import type { RoleStore } from "../+roles/store";
import type { ClusterRoleStore } from "../+cluster-roles/store";
import type { ServiceAccountStore } from "../+service-accounts/store";
import type { RoleBindingsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleBindingStoreInjectable from "./store.injectable";
import roleStoreInjectable from "../+roles/store.injectable";
import clusterRoleStoreInjectable from "../+cluster-roles/store.injectable";
import serviceAccountStoreInjectable from "../+service-accounts/store.injectable";
import openRoleBindingDialogInjectable from "./open-dialog.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

export interface RoleBindingsProps extends RouteComponentProps<RoleBindingsRouteParams> {
}

interface Dependencies {
  roleBindingStore: RoleBindingStore;
  roleStore: RoleStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  openRoleBindingDialog: () => void;
}

const NonInjectedRoleBindings = observer(({ roleBindingStore, roleStore, clusterRoleStore, serviceAccountStore, openRoleBindingDialog }: Dependencies & RoleBindingsProps) => (
  <>
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
        [columnId.age]: binding => binding.getTimeDiffFromNow(),
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
        binding.getAge(),
      ]}
      addRemoveButtons={{
        onAdd: openRoleBindingDialog,
        addTooltip: "Create new RoleBinding",
      }}
    />
    <RoleBindingDialog />
  </>
));

export const RoleBindings = withInjectables<Dependencies, RoleBindingsProps>(NonInjectedRoleBindings, {
  getProps: (di, props) => ({
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    roleStore: di.inject(roleStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openRoleBindingDialog: di.inject(openRoleBindingDialogInjectable),
    ...props,
  }),
});
