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

import "./config-maps.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { configMapsStore } from "./config-maps.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ConfigMapsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  keys = "keys",
  age = "age",
}

interface Props extends RouteComponentProps<ConfigMapsRouteParams> {
}

@observer
export class ConfigMaps extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="configuration_configmaps"
        className="ConfigMaps" store={configMapsStore}
        sortingCallbacks={{
          [columnId.name]: item => item.getName(),
          [columnId.namespace]: item => item.getNs(),
          [columnId.keys]: item => item.getKeys(),
          [columnId.age]: item => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          item => item.getSearchFields(),
          item => item.getKeys(),
        ]}
        renderHeaderTitle="Config Maps"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Keys", className: "keys", sortBy: columnId.keys, id: columnId.keys },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={configMap => [
          configMap.getName(),
          <KubeObjectStatusIcon key="icon" object={configMap}/>,
          configMap.getNs(),
          configMap.getKeys().join(", "),
          configMap.getAge(),
        ]}
      />
    );
  }
}
