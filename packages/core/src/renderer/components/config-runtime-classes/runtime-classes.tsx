/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./runtime-classes.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import runtimeClassStoreInjectable from "./store.injectable";
import type { RuntimeClassStore } from "./store";

enum columnId {
  name = "name",
  handler = "handler",
  age = "age",
}

interface Dependencies {
  runtimeClassStore: RuntimeClassStore;
}

@observer
class NonInjectedRuntimeClasses extends React.Component<Dependencies> {
  render() {
    const { runtimeClassStore } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_runtime_classes"
          className="RuntimeClasses"
          store={runtimeClassStore}
          sortingCallbacks={{
            [columnId.name]: rc => rc.getName(),
            [columnId.handler]: rc => rc.getHandler(),
            [columnId.age]: rc => -rc.getCreationTimestamp(),
          }}
          searchFilters={[
            rc => rc.getSearchFields(),
          ]}
          renderHeaderTitle="Runtime Classes"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Handler", className: "handler", sortBy: columnId.handler, id: columnId.handler },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={rc => [
            rc.getName(),
            <KubeObjectStatusIcon key="icon" object={rc} />,
            rc.getHandler(),
            <KubeObjectAge key="age" object={rc} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const RuntimeClasses = withInjectables<Dependencies>(NonInjectedRuntimeClasses, {
  getProps: (di, props) => ({
    ...props,
    runtimeClassStore: di.inject(runtimeClassStoreInjectable),
  }),
});
