/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { CreateServiceAccountDialog } from "./create-dialog";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../../kube-object/age";
import { prevDefault } from "../../../utils";
import type { ServiceAccountStore } from "./store";
import type { FilterByNamespace } from "../../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import filterByNamespaceInjectable from "../../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import serviceAccountStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  serviceAccountStore: ServiceAccountStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedServiceAccounts extends React.Component<Dependencies> {
  render() {
    const {
      filterByNamespace,
      serviceAccountStore,
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
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => filterByNamespace(account.getNs()))}
            >
              {account.getNs()}
            </a>,
            <KubeObjectAge key="age" object={account} />,
          ]}
          addRemoveButtons={{
            onAdd: () => CreateServiceAccountDialog.open(),
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
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
  }),
});
