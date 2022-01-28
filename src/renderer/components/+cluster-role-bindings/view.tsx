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
import { ClusterRoleBindingDialog } from "./dialog";
import type { ClusterRoleBindingStore } from "./store";
import type { ClusterRoleStore } from "../+cluster-roles/store";
import type { ServiceAccountStore } from "../+service-accounts/store";
import type { ClusterRoleBindingsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import clusterRoleStoreInjectable from "../+cluster-roles/store.injectable";
import serviceAccountStoreInjectable from "../+service-accounts/store.injectable";
import openClusterRoleBindingDialogInjectable from "./open-dialog.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  bindings = "bindings",
  age = "age",
}

export interface ClusterRoleBindingsProps extends RouteComponentProps<ClusterRoleBindingsRouteParams> {
}

interface Dependencies {
  clusterRoleBindingStore: ClusterRoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  openClusterRoleBindingDialog: () => void;
}

const NonInjectedClusterRoleBindings = observer(({ clusterRoleBindingStore, clusterRoleStore, serviceAccountStore, openClusterRoleBindingDialog }: Dependencies & ClusterRoleBindingsProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="access_cluster_role_bindings"
      className="ClusterRoleBindings"
      store={clusterRoleBindingStore}
      dependentStores={[clusterRoleStore, serviceAccountStore]}
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
        onAdd: openClusterRoleBindingDialog,
        addTooltip: "Create new ClusterRoleBinding",
      }}
    />
    <ClusterRoleBindingDialog />
  </>
));

export const ClusterRoleBindings = withInjectables<Dependencies, ClusterRoleBindingsProps>(NonInjectedClusterRoleBindings, {
  getProps: (di, props) => ({
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
    ...props,
  }),
});

