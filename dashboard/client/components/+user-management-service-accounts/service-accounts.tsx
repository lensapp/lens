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
import { ServiceAccountsRouteParams } from "../+user-management";
import { serviceAccountsStore } from "./service-accounts.store";
import { CreateServiceAccountDialog } from "./create-service-account-dialog";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<ServiceAccountsRouteParams> {
}

@observer
export class ServiceAccounts extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <>
        <KubeObjectListLayout
          className="ServiceAccounts" store={serviceAccountsStore}
          sortingCallbacks={{
            [sortBy.name]: (account: ServiceAccount): string => account.getName(),
            [sortBy.namespace]: (account: ServiceAccount): string => account.getNs(),
            [sortBy.age]: (account: ServiceAccount): string => account.metadata.creationTimestamp,
          }}
          searchFilters={[
            (account: ServiceAccount): string[] => account.getSearchFields(),
          ]}
          renderHeaderTitle={<Trans>Service Accounts</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(account: ServiceAccount): (string | number)[] => [
            account.getName(),
            account.getNs(),
            account.getAge(),
          ]}
          renderItemMenu={(item: ServiceAccount): JSX.Element => {
            return <ServiceAccountMenu object={item}/>;
          }}
          addRemoveButtons={{
            onAdd: (): void => CreateServiceAccountDialog.open(),
            addTooltip: <Trans>Create new Service Account</Trans>,
          }}
        />
        <CreateServiceAccountDialog/>
      </>
    );
  }
}

export function ServiceAccountMenu(props: KubeObjectMenuProps<ServiceAccount>): JSX.Element {
  const { object, toolbar } = props;
  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={(): void => openServiceAccountKubeConfig(object)}>
        <Icon material="insert_drive_file" title="Kubeconfig File" interactive={toolbar}/>
        <span className="title"><Trans>Kubeconfig</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  );
}

apiManager.registerViews(serviceAccountsApi, {
  Menu: ServiceAccountMenu,
});
