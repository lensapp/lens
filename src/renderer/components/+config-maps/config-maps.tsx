/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
