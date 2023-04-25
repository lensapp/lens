/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./config-maps.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { ConfigMapStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import configMapStoreInjectable from "./store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  keys = "keys",
  age = "age",
}

interface Dependencies {
  configMapStore: ConfigMapStore;
}

@observer
class NonInjectedConfigMaps extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_configmaps"
          className="ConfigMaps"
          store={this.props.configMapStore}
          sortingCallbacks={{
            [columnId.name]: configMap => configMap.getName(),
            [columnId.namespace]: configMap => configMap.getNs(),
            [columnId.keys]: configMap => configMap.getKeys(),
            [columnId.age]: configMap => -configMap.getCreationTimestamp(),
          }}
          searchFilters={[
            configMap => configMap.getSearchFields(),
            configMap => configMap.getKeys(),
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
            <KubeObjectStatusIcon key="icon" object={configMap} />,
            <NamespaceSelectBadge
              key="namespace"
              namespace={configMap.getNs()}
            />,
            configMap.getKeys().join(", "),
            <KubeObjectAge key="age" object={configMap} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const ConfigMaps = withInjectables<Dependencies>(NonInjectedConfigMaps, {
  getProps: (di, props) => ({
    ...props,
    configMapStore: di.inject(configMapStoreInjectable),
  }),
});
