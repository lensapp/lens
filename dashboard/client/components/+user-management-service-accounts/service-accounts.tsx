import "./service-accounts.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { ServiceAccount, serviceAccountsApi } from "../../api/endpoints/service-accounts.api";
import { RouteComponentProps } from "react-router";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { MenuItem } from "../menu";
import { openServiceAccountKubeConfig } from "../kubeconfig-dialog";
import { Icon } from "../icon";
import { KubeObjectListLayout } from "../kube-object";
import { IServiceAccountsRouteParams } from "../+user-management";
import { serviceAccountsStore } from "./service-accounts.store";
import { CreateServiceAccountDialog } from "./create-service-account-dialog";
import { apiManager } from "../../api/api-manager";

enum sortBy {
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
          className="ServiceAccounts" store={serviceAccountsStore}
          sortingCallbacks={{
            [sortBy.name]: (account: ServiceAccount) => account.getName(),
            [sortBy.namespace]: (account: ServiceAccount) => account.getNs(),
            [sortBy.age]: (account: ServiceAccount) => account.getAge(false),
          }}
          searchFilters={[
            (account: ServiceAccount) => account.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Service Accounts</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(account: ServiceAccount) => [
            account.getName(),
            account.getNs(),
            account.getAge(),
          ]}
          renderItemMenu={(item: ServiceAccount) => {
            return <ServiceAccountMenu object={item}/>
          }}
          addRemoveButtons={{
            onAdd: () => CreateServiceAccountDialog.open(),
            addTooltip: <Trans>Create new Service Account</Trans>,
          }}
        />
        <CreateServiceAccountDialog/>
      </>
    )
  }
}

export function ServiceAccountMenu(props: KubeObjectMenuProps<ServiceAccount>) {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => openServiceAccountKubeConfig(object)}>
        <Icon material="insert_drive_file" title="Kubeconfig File" interactive={toolbar}/>
        <span className="title"><Trans>Kubeconfig</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(serviceAccountsApi, {
  Menu: ServiceAccountMenu,
})