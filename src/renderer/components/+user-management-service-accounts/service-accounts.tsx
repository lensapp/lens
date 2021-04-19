import "./service-accounts.scss";

import React from "react";
import { observer } from "mobx-react";
import { ServiceAccount } from "../../api/endpoints/service-accounts.api";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { IServiceAccountsRouteParams } from "../+user-management";
import { serviceAccountsStore } from "./service-accounts.store";
import { CreateServiceAccountDialog } from "./create-service-account-dialog";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<IServiceAccountsRouteParams> {
}

@observer
export class ServiceAccounts extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_service_accounts"
          className="ServiceAccounts" store={serviceAccountsStore}
          sortingCallbacks={{
            [columnId.name]: (account: ServiceAccount) => account.getName(),
            [columnId.namespace]: (account: ServiceAccount) => account.getNs(),
            [columnId.age]: (account: ServiceAccount) => account.getTimeDiffFromNow(),
          }}
          searchFilters={[
            (account: ServiceAccount) => account.getSearchFields(),
          ]}
          renderHeaderTitle="Service Accounts"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={(account: ServiceAccount) => [
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
