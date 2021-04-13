import "./config-maps.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { configMapsStore } from "./config-maps.store";
import { ConfigMap } from "../../api/endpoints/configmap.api";
import { KubeObjectListLayout } from "../kube-object";
import { IConfigMapsRouteParams } from "./config-maps.route";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  keys = "keys",
  age = "age",
}

interface Props extends RouteComponentProps<IConfigMapsRouteParams> {
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
          [columnId.name]: (item: ConfigMap) => item.getName(),
          [columnId.namespace]: (item: ConfigMap) => item.getNs(),
          [columnId.keys]: (item: ConfigMap) => item.getKeys(),
          [columnId.age]: (item: ConfigMap) => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (item: ConfigMap) => item.getSearchFields(),
          (item: ConfigMap) => item.getKeys()
        ]}
        renderHeaderTitle="Config Maps"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Keys", className: "keys", sortBy: columnId.keys, id: columnId.keys },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(configMap: ConfigMap) => [
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
