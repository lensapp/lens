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

import "./secrets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { AddSecretDialog } from "./add-secret-dialog";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { secretsStore } from "./secrets.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { SecretsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  labels = "labels",
  keys = "keys",
  type = "type",
  age = "age",
}

interface Props extends RouteComponentProps<SecretsRouteParams> {
}

@observer
export class Secrets extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_secrets"
          className="Secrets" store={secretsStore}
          sortingCallbacks={{
            [columnId.name]: item => item.getName(),
            [columnId.namespace]: item => item.getNs(),
            [columnId.labels]: item => item.getLabels(),
            [columnId.keys]: item => item.getKeys(),
            [columnId.type]: item => item.type,
            [columnId.age]: item => item.getTimeDiffFromNow(),
          }}
          searchFilters={[
            item => item.getSearchFields(),
            item => item.getKeys(),
          ]}
          renderHeaderTitle="Secrets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Labels", className: "labels", sortBy: columnId.labels, id: columnId.labels },
            { title: "Keys", className: "keys", sortBy: columnId.keys, id: columnId.keys },
            { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={secret => [
            secret.getName(),
            <KubeObjectStatusIcon key="icon" object={secret} />,
            secret.getNs(),
            secret.getLabels().map(label => <Badge key={label} label={label} expandable={false}/>),
            secret.getKeys().join(", "),
            secret.type,
            secret.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddSecretDialog.open(),
            addTooltip: "Create new Secret",
          }}
        />
        <AddSecretDialog/>
      </>
    );
  }
}
