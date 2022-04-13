/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-list.scss";

import React from "react";
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { iter, stopPropagation } from "../../utils";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { customResourceDefinitionStore } from "./legacy-store";
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
  private readonly selectedGroups = observable.set(crdGroupsUrlParam.get());

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get items() {
    if (this.selectedGroups.size) {
      return customResourceDefinitionStore.items.filter(item => this.selectedGroups.has(item.getGroup()));
    }

    return customResourceDefinitionStore.items; // show all by default
  }

  toggleSelection = (options: readonly ({ group: string })[]) => {
    const groups = options.map(({ group }) => group);

    this.selectedGroups.replace(groups);
    crdGroupsUrlParam.set(groups);
  };

  private getPlaceholder() {
    if (this.selectedGroups.size === 0)  {
      return "All groups";
    }

    const prefix = this.selectedGroups.size === 1
      ? "Group"
      : "Groups";

    return `${prefix}: ${iter.join(this.selectedGroups, ", ")}`;
  }

  render() {
    const { items, selectedGroups } = this;

    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="crd"
          className="CrdList"
          store={customResourceDefinitionStore}
          // Don't subscribe the `customResourceDefinitionStore` because <Sidebar> already has and is always mounted
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
          customizeHeader={({ filters, ...headerPlaceholders }) => ({
            // todo: move to global filters
            filters: (
              <>
                {filters}
                <Select
                  className="group-select"
                  placeholder={this.getPlaceholder()}
                  options={Object.keys(customResourceDefinitionStore.groups).map(group => ({ group }))}
                  onChange={this.toggleSelection}
                  closeMenuOnSelect={false}
                  controlShouldRenderValue={false}
                  isOptionSelected={opt => this.selectedGroups.has(opt.group)}
                  isMulti={true}
                  formatOptionLabel={({ group }) => (
                    <div className="flex gaps align-center">
                      <Icon small material="folder" />
                      <span>{group}</span>
                      {selectedGroups.has(group) && (
                        <Icon
                          small
                          material="check"
                          className="box right"
                        />
                      )}
                    </div>
                  )}
                />
              </>
            ),
            ...headerPlaceholders,
          })}
          renderTableHeader={[
            { title: "Resource", className: "kind", sortBy: columnId.kind, id: columnId.kind },
            { title: "Group", className: "group", sortBy: columnId.group, id: columnId.group },
            { title: "Version", className: "version", sortBy: columnId.version, id: columnId.version },
            { title: "Scope", className: "scope", sortBy: columnId.scope, id: columnId.scope },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={crd => [
            <Link
              key="link"
              to={crd.getResourceUrl()}
              onClick={stopPropagation}
            >
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
