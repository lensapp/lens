/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./limit-ranges.scss";

import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import React from "react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { LimitRangeStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import limitRangeStoreInjectable from "./store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  limitRangeStore: LimitRangeStore;
}

@observer
class NonInjectedLimitRanges extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_limitranges"
          className="LimitRanges"
          store={this.props.limitRangeStore}
          sortingCallbacks={{
            [columnId.name]: limitRange => limitRange.getName(),
            [columnId.namespace]: limitRange => limitRange.getNs(),
            [columnId.age]: limitRange => -limitRange.getCreationTimestamp(),
          }}
          searchFilters={[
            item => item.getName(),
            item => item.getNs(),
          ]}
          renderHeaderTitle="Limit Ranges"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={limitRange => [
            limitRange.getName(),
            <KubeObjectStatusIcon key="icon" object={limitRange}/>,
            <NamespaceSelectBadge
              key="namespace"
              namespace={limitRange.getNs()}
            />,
            <KubeObjectAge key="age" object={limitRange} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const LimitRanges = withInjectables<Dependencies>(NonInjectedLimitRanges, {
  getProps: (di, props) => ({
    ...props,
    limitRangeStore: di.inject(limitRangeStoreInjectable),
  }),
});
