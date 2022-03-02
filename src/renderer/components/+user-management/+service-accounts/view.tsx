/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { CreateServiceAccountDialog } from "./create-dialog";
import { serviceAccountsStore } from "./store";
import type { ServiceAccountsRouteParams } from "../../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface ServiceAccountsProps extends RouteComponentProps<ServiceAccountsRouteParams> {
}

@observer
export class ServiceAccounts extends React.Component<ServiceAccountsProps> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_service_accounts"
          className="ServiceAccounts" store={serviceAccountsStore}
          sortingCallbacks={{
            [columnId.name]: account => account.getName(),
            [columnId.namespace]: account => account.getNs(),
            [columnId.age]: account => account.getTimeDiffFromNow(),
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
            account.getNs(),
            account.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => CreateServiceAccountDialog.open(),
            addTooltip: "Create new Service Account",
          }}
        />
        <CreateServiceAccountDialog/>
      </>
    );
  }
}

