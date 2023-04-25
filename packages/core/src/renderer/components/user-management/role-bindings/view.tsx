/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { RoleBindingDialog } from "./dialog/view";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import type { RoleStore } from "../roles/store";
import type { ServiceAccountStore } from "../service-accounts/store";
import type { RoleBindingStore } from "./store";
import type { ClusterRoleStore } from "../cluster-roles/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleStoreInjectable from "../cluster-roles/store.injectable";
import roleBindingStoreInjectable from "./store.injectable";
import roleStoreInjectable from "../roles/store.injectable";
import serviceAccountStoreInjectable from "../service-accounts/store.injectable";
import type { OpenRoleBindingDialog } from "./dialog/open.injectable";
import openRoleBindingDialogInjectable from "./dialog/open.injectable";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

interface Dependencies {
  roleBindingStore: RoleBindingStore;
  roleStore: RoleStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  openRoleBindingDialog: OpenRoleBindingDialog;
}

@observer
class NonInjectedRoleBindings extends React.Component<Dependencies> {
  render() {
    const {
      clusterRoleStore,
      roleBindingStore,
      roleStore,
      serviceAccountStore,
      openRoleBindingDialog,
    } = this.props;

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
            <NamespaceSelectBadge
              key="namespace"
              namespace={binding.getNs()}
            />,
            binding.getSubjectNames(),
            <KubeObjectAge key="age" object={binding} />,
          ]}
          addRemoveButtons={{
            onAdd: () => openRoleBindingDialog(),
            addTooltip: "Create new RoleBinding",
          }}
        />
        <RoleBindingDialog />
      </SiblingsInTabLayout>
    );
  }
}

export const RoleBindings = withInjectables<Dependencies>(NonInjectedRoleBindings, {
  getProps: (di, props) => ({
    ...props,
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    roleStore: di.inject(roleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openRoleBindingDialog: di.inject(openRoleBindingDialogInjectable),
  }),
});
