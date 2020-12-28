import "./resource-quotas.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { ResourceQuota } from "../../api/endpoints/resource-quota.api";
import { AddQuotaDialog } from "./add-quota-dialog";
import { resourceQuotaStore } from "./resource-quotas.store";
import { IResourceQuotaRouteParams } from "./resource-quotas.route";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age"
}

interface Props extends RouteComponentProps<IResourceQuotaRouteParams> {
}

@observer
export class ResourceQuotas extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          className="ResourceQuotas" store={resourceQuotaStore}
          sortingCallbacks={{
            [sortBy.name]: (item: ResourceQuota) => item.getName(),
            [sortBy.namespace]: (item: ResourceQuota) => item.getNs(),
            [sortBy.age]: (item: ResourceQuota) => item.metadata.creationTimestamp,
          }}
          searchFilters={[
            (item: ResourceQuota) => item.getSearchFields(),
            (item: ResourceQuota) => item.getName(),
          ]}
          renderHeaderTitle="Resource Quotas"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Age", className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(resourceQuota: ResourceQuota) => [
            resourceQuota.getName(),
            <KubeObjectStatusIcon key="icon" object={resourceQuota}/>,
            resourceQuota.getNs(),
            resourceQuota.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddQuotaDialog.open(),
            addTooltip: "Create new ResourceQuota"
          }}
        />
        <AddQuotaDialog/>
      </>
    );
  }
}
