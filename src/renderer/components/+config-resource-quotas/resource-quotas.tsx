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

enum columnId {
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
          isConfigurable
          tableId="configuration_quotas"
          className="ResourceQuotas" store={resourceQuotaStore}
          sortingCallbacks={{
            [columnId.name]: (item: ResourceQuota) => item.getName(),
            [columnId.namespace]: (item: ResourceQuota) => item.getNs(),
            [columnId.age]: (item: ResourceQuota) => item.getTimeDiffFromNow(),
          }}
          searchFilters={[
            (item: ResourceQuota) => item.getSearchFields(),
            (item: ResourceQuota) => item.getName(),
          ]}
          renderHeaderTitle="Resource Quotas"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
