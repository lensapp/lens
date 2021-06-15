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
import type { Role } from "../../../api/endpoints";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../../kube-object-status-icon";
import { AddRoleDialog } from "./add-dialog";
import { rolesStore } from "./store";
import type { RolesRouteParams } from "../../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<RolesRouteParams> {
}

@observer
export class Roles extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_roles"
          className="Roles"
          store={rolesStore}
          sortingCallbacks={{
            [columnId.name]: (role: Role) => role.getName(),
            [columnId.namespace]: (role: Role) => role.getNs(),
            [columnId.age]: (role: Role) => role.getTimeDiffFromNow(),
          }}
          searchFilters={[
            (role: Role) => role.getSearchFields(),
          ]}
          renderHeaderTitle="Roles"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={(role: Role) => [
            role.getName(),
            <KubeObjectStatusIcon key="icon" object={role} />,
            role.getNs(),
            role.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddRoleDialog.open(),
            addTooltip: "Create new Role",
          }}
        />
        <AddRoleDialog/>
      </>
    );
  }
}
