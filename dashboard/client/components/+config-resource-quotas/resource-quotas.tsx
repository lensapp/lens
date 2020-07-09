import "./resource-quotas.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { ResourceQuota, resourceQuotaApi } from "../../api/endpoints/resource-quota.api";
import { AddQuotaDialog } from "./add-quota-dialog";
import { resourceQuotaStore } from "./resource-quotas.store";
import { ResourceQuotaRouteParams } from "./resource-quotas.route";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age"
}

interface Props extends RouteComponentProps<ResourceQuotaRouteParams> {
}

@observer
export class ResourceQuotas extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <>
        <KubeObjectListLayout
          className="ResourceQuotas" store={resourceQuotaStore}
          sortingCallbacks={{
            [sortBy.name]: (item: ResourceQuota): string => item.getName(),
            [sortBy.namespace]: (item: ResourceQuota): string => item.getNs(),
            [sortBy.age]: (item: ResourceQuota): string => item.metadata.creationTimestamp,
          }}
          searchFilters={[
            (item: ResourceQuota): string[] => item.getSearchFields(),
            (item: ResourceQuota): string => item.getName(),
          ]}
          renderHeaderTitle={<Trans>Resource Quotas</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(resourceQuota: ResourceQuota): (string | number)[] => [
            resourceQuota.getName(),
            resourceQuota.getNs(),
            resourceQuota.getAge(),
          ]}
          renderItemMenu={(item: ResourceQuota): JSX.Element => <ResourceQuotaMenu object={item} />}
          addRemoveButtons={{
            onAdd: (): void => AddQuotaDialog.open(),
            addTooltip: <Trans>Create new ResourceQuota</Trans>
          }}
        />
        <AddQuotaDialog/>
      </>
    );
  }
}

export function ResourceQuotaMenu(props: KubeObjectMenuProps<ResourceQuota>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(resourceQuotaApi, {
  Menu: ResourceQuotaMenu,
});
