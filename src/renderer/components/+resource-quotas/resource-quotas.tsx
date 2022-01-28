/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-quotas.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { AddResourceQuotaDialog } from "./add-dialog";
import type { ResourceQuotaStore } from "./store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ResourceQuotaRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaStoreInjectable from "./store.injectable";
import openAddResourceQuotaDialogInjectable from "./add-dialog-open.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface ResourceQuotasProps extends RouteComponentProps<ResourceQuotaRouteParams> {
}

interface Dependencies {
  resourceQuotaStore: ResourceQuotaStore;
  openAddResourceQuotaDialog: () => void;
}

const NonInjectedResourceQuotas = observer(({ resourceQuotaStore, openAddResourceQuotaDialog }: Dependencies & ResourceQuotasProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="configuration_quotas"
      className="ResourceQuotas" store={resourceQuotaStore}
      sortingCallbacks={{
        [columnId.name]: item => item.getName(),
        [columnId.namespace]: item => item.getNs(),
        [columnId.age]: item => item.getTimeDiffFromNow(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
        item => item.getName(),
      ]}
      renderHeaderTitle="Resource Quotas"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={resourceQuota => [
        resourceQuota.getName(),
        <KubeObjectStatusIcon key="icon" object={resourceQuota}/>,
        resourceQuota.getNs(),
        resourceQuota.getAge(),
      ]}
      addRemoveButtons={{
        onAdd: openAddResourceQuotaDialog,
        addTooltip: "Create new ResourceQuota",
      }}
    />
    <AddResourceQuotaDialog/>
  </>
));

export const ResourceQuotas = withInjectables<Dependencies, ResourceQuotasProps>(NonInjectedResourceQuotas, {
  getProps: (di, props) => ({
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
    openAddResourceQuotaDialog: di.inject(openAddResourceQuotaDialogInjectable),
    ...props,
  }),
});
