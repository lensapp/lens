/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { CreateServiceAccountDialog } from "./create-dialog/view";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import type { ServiceAccountStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import serviceAccountStoreInjectable from "./store.injectable";
import type { OpenCreateServiceAccountDialog } from "./create-dialog/open.injectable";
import openCreateServiceAccountDialogInjectable from "./create-dialog/open.injectable";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  serviceAccountStore: ServiceAccountStore;
  openCreateServiceAccountDialog: OpenCreateServiceAccountDialog;
}

@observer
class NonInjectedServiceAccounts extends React.Component<Dependencies> {
  render() {
    const {
      serviceAccountStore,
      openCreateServiceAccountDialog,
    } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_service_accounts"
          className="ServiceAccounts"
          store={serviceAccountStore}
          sortingCallbacks={{
            [columnId.name]: account => account.getName(),
            [columnId.namespace]: account => account.getNs(),
            [columnId.age]: account => -account.getCreationTimestamp(),
          }}
          searchFilters={[
            account => account.getSearchFields(),
          ]}
          renderHeaderTitle="Service Accounts"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={account => [
            account.getName(),
            <KubeObjectStatusIcon key="icon" object={account} />,
            <NamespaceSelectBadge
              key="namespace"
              namespace={account.getNs()}
            />,
            <KubeObjectAge key="age" object={account} />,
          ]}
          addRemoveButtons={{
            onAdd: () => openCreateServiceAccountDialog(),
            addTooltip: "Create new Service Account",
          }}
        />
        <CreateServiceAccountDialog/>
      </SiblingsInTabLayout>
    );
  }
}

export const ServiceAccounts = withInjectables<Dependencies>(NonInjectedServiceAccounts, {
  getProps: (di, props) => ({
    ...props,
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    openCreateServiceAccountDialog: di.inject(openCreateServiceAccountDialogInjectable),
  }),
});
