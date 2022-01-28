/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./storage-classes.scss";

import React from "react";
import type { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { StorageClassStore } from "./store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { StorageClassesRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import storageClassStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  age = "age",
  provisioner = "provision",
  default = "default",
  reclaimPolicy = "reclaim",
}

export interface StorageClassesProps extends RouteComponentProps<StorageClassesRouteParams> {
}

interface Dependencies {
  storageClassStore: StorageClassStore;
}

const NonInjectedStorageClasses = observer(({ storageClassStore }: Dependencies & StorageClassesProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="storage_classes"
    className="StorageClasses"
    store={storageClassStore}
    sortingCallbacks={{
      [columnId.name]: item => item.getName(),
      [columnId.age]: item => item.getTimeDiffFromNow(),
      [columnId.provisioner]: item => item.provisioner,
      [columnId.reclaimPolicy]: item => item.reclaimPolicy,
    }}
    searchFilters={[
      item => item.getSearchFields(),
      item => item.provisioner,
    ]}
    renderHeaderTitle="Storage Classes"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Provisioner", className: "provisioner", sortBy: columnId.provisioner, id: columnId.provisioner },
      { title: "Reclaim Policy", className: "reclaim-policy", sortBy: columnId.reclaimPolicy, id: columnId.reclaimPolicy },
      { title: "Default", className: "is-default", id: columnId.default },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={storageClass => [
      storageClass.getName(),
      <KubeObjectStatusIcon key="icon" object={storageClass} />,
      storageClass.provisioner,
      storageClass.getReclaimPolicy(),
      storageClass.isDefault() ? "Yes" : null,
      storageClass.getAge(),
    ]}
  />
));

export const StorageClasses = withInjectables<Dependencies, StorageClassesProps>(NonInjectedStorageClasses, {
  getProps: (di, props) => ({
    storageClassStore: di.inject(storageClassStoreInjectable),
    ...props,
  }),
});

