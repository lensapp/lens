/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./network-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { NetworkPolicyStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import networkPolicyStoreInjectable from "./store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  types = "types",
  age = "age",
}

interface Dependencies {
  networkPolicyStore: NetworkPolicyStore;
}

@observer
class NonInjectedNetworkPolicies extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="network_policies"
          className="NetworkPolicies"
          store={this.props.networkPolicyStore}
          sortingCallbacks={{
            [columnId.name]: networkPolicy => networkPolicy.getName(),
            [columnId.namespace]: networkPolicy => networkPolicy.getNs(),
            [columnId.age]: networkPolicy => -networkPolicy.getCreationTimestamp(),
          }}
          searchFilters={[
            networkPolicy => networkPolicy.getSearchFields(),
          ]}
          renderHeaderTitle="Network Policies"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Policy Types", className: "type", id: columnId.types },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={networkPolicy => [
            networkPolicy.getName(),
            <KubeObjectStatusIcon key="icon" object={networkPolicy} />,
            <NamespaceSelectBadge
              key="namespace"
              namespace={networkPolicy.getNs()}
            />,
            networkPolicy.getTypes().join(", "),
            <KubeObjectAge key="age" object={networkPolicy} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const NetworkPolicies = withInjectables<Dependencies>(NonInjectedNetworkPolicies, {
  getProps: (di, props) => ({
    ...props,
    networkPolicyStore: di.inject(networkPolicyStoreInjectable),
  }),
});
