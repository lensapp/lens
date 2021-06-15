/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./storage-classes.scss";

import React from "react";
import type { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import type { StorageClass } from "../../api/endpoints/storage-class.api";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { storageClassStore } from "./storage-class.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { StorageClassesRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  age = "age",
  provisioner = "provision",
  default = "default",
  reclaimPolicy = "reclaim",
}

interface Props extends RouteComponentProps<StorageClassesRouteParams> {
}

@observer
export class StorageClasses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="storage_classes"
        className="StorageClasses"
        store={storageClassStore}
        sortingCallbacks={{
          [columnId.name]: (item: StorageClass) => item.getName(),
          [columnId.age]: (item: StorageClass) => item.getTimeDiffFromNow(),
          [columnId.provisioner]: (item: StorageClass) => item.provisioner,
          [columnId.reclaimPolicy]: (item: StorageClass) => item.reclaimPolicy,
        }}
        searchFilters={[
          (item: StorageClass) => item.getSearchFields(),
          (item: StorageClass) => item.provisioner,
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
        renderTableContents={(storageClass: StorageClass) => [
          storageClass.getName(),
          <KubeObjectStatusIcon key="icon" object={storageClass} />,
          storageClass.provisioner,
          storageClass.getReclaimPolicy(),
          storageClass.isDefault() ? "Yes" : null,
          storageClass.getAge(),
        ]}
      />
    );
  }
}
