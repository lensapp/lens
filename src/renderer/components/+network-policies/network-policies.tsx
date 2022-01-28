/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./network-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NetworkPolicyStore } from "./store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { NetworkPoliciesRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import networkPolicyStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  types = "types",
  age = "age",
}

export interface NetworkPoliciesProps extends RouteComponentProps<NetworkPoliciesRouteParams> {
}

interface Dependencies {
  networkPolicyStore: NetworkPolicyStore;
}

const NonInjectedNetworkPolicies = observer(({ networkPolicyStore }: Dependencies & NetworkPoliciesProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="network_policies"
    className="NetworkPolicies"
    store={networkPolicyStore}
    sortingCallbacks={{
      [columnId.name]: item => item.getName(),
      [columnId.namespace]: item => item.getNs(),
      [columnId.age]: item => item.getTimeDiffFromNow(),
    }}
    searchFilters={[
      item => item.getSearchFields(),
    ]}
    renderHeaderTitle="Network Policies"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Policy Types", className: "type", id: columnId.types },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={item => [
      item.getName(),
      <KubeObjectStatusIcon key="icon" object={item} />,
      item.getNs(),
      item.getTypes().join(", "),
      item.getAge(),
    ]}
  />
));

export const NetworkPolicies = withInjectables<Dependencies, NetworkPoliciesProps>(NonInjectedNetworkPolicies, {
  getProps: (di, props) => ({
    networkPolicyStore: di.inject(networkPolicyStoreInjectable),
    ...props,
  }),
});

