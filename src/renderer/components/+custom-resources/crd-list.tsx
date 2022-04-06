/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-list.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { crdStore } from "./crd.store";
import type { SelectOption } from "../select";
import { Select } from "../select";
import { createPageParam } from "../../navigation";
import { Icon } from "../icon";
import { KubeObjectAge } from "../kube-object/age";
import { TabLayout } from "../layout/tab-layout-2";

export const crdGroupsUrlParam = createPageParam<string[]>({
  name: "groups",
  defaultValue: [],
});

enum columnId {
  kind = "kind",
  group = "group",
  version = "version",
  scope = "scope",
  age = "age",
}

@observer
export class CustomResourceDefinitions extends React.Component {
  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  get selectedGroups(): string[] {
    return crdGroupsUrlParam.get();
  }

  @computed get items() {
    if (this.selectedGroups.length) {
      return crdStore.items.filter(item => this.selectedGroups.includes(item.getGroup()));
    }

    return crdStore.items; // show all by default
  }

  toggleSelection(group: string) {
    const groups = new Set(crdGroupsUrlParam.get());

    if (groups.has(group)) {
      groups.delete(group);
    } else {
      groups.add(group);
    }
    crdGroupsUrlParam.set([...groups]);
  }

  render() {
    const { items, selectedGroups } = this;

    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="crd"
          className="CrdList"
          store={crdStore}
          // Don't subscribe the `crdStore` because <Sidebar> already has and is always mounted
          subscribeStores={false}
          items={items}
          sortingCallbacks={{
            [columnId.kind]: crd => crd.getResourceKind(),
            [columnId.group]: crd => crd.getGroup(),
            [columnId.version]: crd => crd.getVersion(),
            [columnId.scope]: crd => crd.getScope(),
            [columnId.age]: crd => -crd.getCreationTimestamp(),
          }}
          searchFilters={[
            crd => crd.getResourceKind(),
            crd => crd.getGroup(),
            crd => crd.getVersion(),
            crd => crd.getScope(),
            crd => -crd.getCreationTimestamp(),
          ]}
          renderHeaderTitle="Custom Resources"
          customizeHeader={({ filters, ...headerPlaceholders }) => {
            let placeholder = <>All groups</>;

            if (selectedGroups.length == 1) placeholder = <>Group: {selectedGroups[0]}</>;
            if (selectedGroups.length >= 2) placeholder = <>Groups: {selectedGroups.join(", ")}</>;

            return {
              // todo: move to global filters
              filters: (
                <>
                  {filters}
                  <Select
                    id="crd-input"
                    className="group-select"
                    placeholder={placeholder}
                    options={Object.keys(crdStore.groups)}
                    onChange={({ value: group }: SelectOption) => this.toggleSelection(group)}
                    closeMenuOnSelect={false}
                    controlShouldRenderValue={false}
                    formatOptionLabel={({ value: group }: SelectOption) => {
                      const isSelected = selectedGroups.includes(group);

                      return (
                        <div className="flex gaps align-center">
                          <Icon small material="folder"/>
                          <span>{group}</span>
                          {isSelected && <Icon small material="check" className="box right"/>}
                        </div>
                      );
                    }}
                  />
                </>
              ),
              ...headerPlaceholders,
            };
          }}
          renderTableHeader={[
            { title: "Resource", className: "kind", sortBy: columnId.kind, id: columnId.kind },
            { title: "Group", className: "group", sortBy: columnId.group, id: columnId.group },
            { title: "Version", className: "version", sortBy: columnId.version, id: columnId.version },
            { title: "Scope", className: "scope", sortBy: columnId.scope, id: columnId.scope },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={crd => [
            <Link key="link" to={crd.getResourceUrl()} onClick={stopPropagation}>
              {crd.getResourceKind()}
            </Link>,
            crd.getGroup(),
            crd.getVersion(),
            crd.getScope(),
            <KubeObjectAge key="age" object={crd} />,
          ]}
        />
      </TabLayout>
    );
  }
}
