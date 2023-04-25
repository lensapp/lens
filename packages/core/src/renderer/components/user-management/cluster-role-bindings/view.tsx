/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { ClusterRoleBindingDialog } from "./dialog/view";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import type { ClusterRoleBindingStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import type { ClusterRoleStore } from "../cluster-roles/store";
import type { ServiceAccountStore } from "../service-accounts/store";
import clusterRoleStoreInjectable from "../cluster-roles/store.injectable";
import serviceAccountStoreInjectable from "../service-accounts/store.injectable";
import type { OpenClusterRoleBindingDialog } from "./dialog/open.injectable";
import openClusterRoleBindingDialogInjectable from "./dialog/open.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

interface Dependencies {
  clusterRoleBindingStore: ClusterRoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  openClusterRoleBindingDialog: OpenClusterRoleBindingDialog;
}

@observer
class NonInjectedClusterRoleBindings extends React.Component<Dependencies> {
  render() {
    const {
      clusterRoleBindingStore,
      clusterRoleStore,
      serviceAccountStore,
      openClusterRoleBindingDialog,
    } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_cluster_role_bindings"
          className="ClusterRoleBindings"
          store={clusterRoleBindingStore}
          dependentStores={[clusterRoleStore, serviceAccountStore]}
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
            onAdd: () => openClusterRoleBindingDialog(),
            addTooltip: "Create new ClusterRoleBinding",
          }}
        />
        <ClusterRoleBindingDialog />
      </SiblingsInTabLayout>
    );
  }
}

export const ClusterRoleBindings = withInjectables<Dependencies>(NonInjectedClusterRoleBindings, {
  getProps: (di, props) => ({
    ...props,
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
  }),
});
