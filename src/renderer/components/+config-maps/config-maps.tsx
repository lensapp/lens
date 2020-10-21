import "./config-maps.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { configMapsStore } from "./config-maps.store";
import { ConfigMap, configMapApi } from "../../api/endpoints/configmap.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { IConfigMapsRouteParams } from "./config-maps.route";
import { apiManager } from "../../api/api-manager";

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
        renderHeaderTitle={<Trans>Config Maps</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Keys</Trans>, className: "keys", sortBy: sortBy.keys },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(configMap: ConfigMap) => [
          configMap.getName(),
          configMap.getNs(),
          configMap.getKeys().join(", "),
          configMap.getAge(),
        ]}
      />
    );
  }
}

