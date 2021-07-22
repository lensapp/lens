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

import "./view.scss";

import { observer } from "mobx-react";
import React from "react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../../kube-object";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { AddClusterRoleDialog } from "./add-dialog";
import { clusterRolesStore } from "./store";
import type { ClusterRolesRouteParams } from "../../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<ClusterRolesRouteParams> {
}

@observer
export class ClusterRoles extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_cluster_roles"
          className="ClusterRoles"
          store={clusterRolesStore}
          sortingCallbacks={{
            [columnId.name]: clusterRole => clusterRole.getName(),
            [columnId.age]: clusterRole => clusterRole.getTimeDiffFromNow(),
          }}
          searchFilters={[
            clusterRole => clusterRole.getSearchFields(),
          ]}
          renderHeaderTitle="Cluster Roles"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={clusterRole => [
            clusterRole.getName(),
            <KubeObjectStatusIcon key="icon" object={clusterRole} />,
            clusterRole.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddClusterRoleDialog.open(),
            addTooltip: "Create new ClusterRole",
          }}
        />
        <AddClusterRoleDialog/>
      </>
    );
  }
}
