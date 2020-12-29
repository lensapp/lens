import "./config-maps.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { configMapsStore } from "./config-maps.store";
import { ConfigMap } from "../../api/endpoints/configmap.api";
import { KubeObjectListLayout } from "../kube-object";
import { IConfigMapsRouteParams } from "./config-maps.route";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
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
        className="ConfigMaps" store={configMapsStore}
        sortingCallbacks={{
          [sortBy.name]: (item: ConfigMap) => item.getName(),
          [sortBy.namespace]: (item: ConfigMap) => item.getNs(),
          [sortBy.keys]: (item: ConfigMap) => item.getKeys(),
          [sortBy.age]: (item: ConfigMap) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: ConfigMap) => item.getSearchFields(),
          (item: ConfigMap) => item.getKeys()
        ]}
        renderHeaderTitle="Config Maps"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Keys", className: "keys", sortBy: sortBy.keys },
          { title: "Age", className: "age", sortBy: sortBy.age },
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
