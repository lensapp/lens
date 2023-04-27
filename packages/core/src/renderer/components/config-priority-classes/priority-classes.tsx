/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./priority-classes.scss";

import * as React from "react";
import { observer } from "mobx-react";
import type { PriorityClass } from "@k8slens/kube-object";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import priorityClassStoreInjectable from "./store.injectable";
import type { PriorityClassStore } from "./store";
import autoBindReact from "auto-bind/react";

enum columnId {
  name = "name",
  value = "value",
  globalDefault = "global-default",
  age = "age",
}

export interface PriorityClassesProps extends KubeObjectDetailsProps<PriorityClass> {
}

interface Dependencies {
  priorityClassStore: PriorityClassStore;
}

@observer
class NonInjectedPriorityClasses extends React.Component<PriorityClassesProps & Dependencies> {
  constructor(props: PriorityClassesProps & Dependencies) {
    super(props);
    autoBindReact(this);
  }

  render() {
    const { priorityClassStore } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_priority_classes"
          className="PriorityClasses"
          store={priorityClassStore}
          sortingCallbacks={{
            [columnId.name]: pc => pc.getName(),
            [columnId.value]: pc => pc.getValue(),
            [columnId.globalDefault]: pc => pc.getGlobalDefault(),
            [columnId.age]: pc => -pc.getCreationTimestamp(),
          }}
          searchFilters={[
            pc => pc.getSearchFields(),
          ]}
          renderHeaderTitle="Priority Classes"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Value", className: "value", sortBy: columnId.value, id: columnId.value },
            { title: "Global Default", className: "global-default", sortBy: columnId.globalDefault, id: columnId.globalDefault },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={pc => [
            pc.getName(),
            <KubeObjectStatusIcon key="icon" object={pc} />,
            pc.getValue(),
            pc.getGlobalDefault(),
            <KubeObjectAge key="age" object={pc} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const PriorityClasses = withInjectables<Dependencies, PriorityClassesProps>(NonInjectedPriorityClasses, {
  getProps: (di, props) => ({
    ...props,
    priorityClassStore: di.inject(priorityClassStoreInjectable),
  }),
});
