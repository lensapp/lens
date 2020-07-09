import "./config-maps.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { configMapsStore } from "./config-maps.store";
import { ConfigMap, configMapApi } from "../../api/endpoints/configmap.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { ConfigMapsRouteParams } from "./config-maps.route";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  keys = "keys",
  age = "age",
}

interface Props extends RouteComponentProps<ConfigMapsRouteParams> {
}

@observer
export class ConfigMaps extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="ConfigMaps" store={configMapsStore}
        sortingCallbacks={{
          [sortBy.name]: (item: ConfigMap): string => item.getName(),
          [sortBy.namespace]: (item: ConfigMap): string => item.getNs(),
          [sortBy.keys]: (item: ConfigMap): string[] => item.getKeys(),
          [sortBy.age]: (item: ConfigMap): string => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: ConfigMap): string[] => item.getSearchFields(),
          (item: ConfigMap): string[] => item.getKeys()
        ]}
        renderHeaderTitle={<Trans>Config Maps</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Keys</Trans>, className: "keys", sortBy: sortBy.keys },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(configMap: ConfigMap): (string | number)[] => [
          configMap.getName(),
          configMap.getNs(),
          configMap.getKeys().join(", "),
          configMap.getAge(),
        ]}
        renderItemMenu={(item: ConfigMap): JSX.Element => {
          return <ConfigMapMenu object={item}/>;
        }}
      />
    );
  }
}

export function ConfigMapMenu(props: KubeObjectMenuProps<ConfigMap>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(configMapApi, {
  Menu: ConfigMapMenu,
});
