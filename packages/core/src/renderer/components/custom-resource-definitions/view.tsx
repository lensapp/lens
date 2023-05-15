/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { iter, stopPropagation } from "@k8slens/utilities";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Select } from "../select";
import { Icon } from "@k8slens/icon";
import { KubeObjectAge } from "../kube-object/age";
import { TabLayout } from "../layout/tab-layout-2";
import type { PageParam } from "../../navigation/page-param";
import type { CustomResourceDefinitionStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import selectedCustomResourceDefinitionGroupsUrlParamInjectable from "./selected-groups-url-param.injectable";
import customResourceDefinitionStoreInjectable from "./store.injectable";

enum columnId {
  kind = "kind",
  group = "group",
  version = "version",
  scope = "scope",
  age = "age",
}

interface Dependencies {
  selectedGroups: PageParam<Set<string>>;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

@observer
class NonInjectedCustomResourceDefinitions extends React.Component<Dependencies> {
  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get items() {
    const selectedGroups = this.props.selectedGroups.get();

    if (selectedGroups.size) {
      return this.props.customResourceDefinitionStore.items.filter(item => selectedGroups.has(item.getGroup()));
    }

    return this.props.customResourceDefinitionStore.items; // show all by default
  }

  @computed get groupSelectOptions() {
    const selectedGroups = this.props.selectedGroups.get();

    return Object.keys(this.props.customResourceDefinitionStore.groups)
      .map(group => ({
        value: group,
        label: group,
        isSelected: selectedGroups.has(group),
      }));
  }

  toggleSelection = (options: readonly ({ value: string })[]) => {
    this.props.selectedGroups.setRaw(options.map(({ value }) => value));
  };

  private getPlaceholder() {
    const selectedGroups = this.props.selectedGroups.get();

    if (selectedGroups.size === 0)  {
      return "All groups";
    }

    const prefix = selectedGroups.size === 1
      ? "Group"
      : "Groups";

    return `${prefix}: ${iter.join(selectedGroups.values(), ", ")}`;
  }

  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="crd"
          className="CustomResourceDefinitions"
          store={this.props.customResourceDefinitionStore}
          // Don't subscribe the `customResourceDefinitionStore` because <Sidebar> already has and is always mounted
          subscribeStores={false}
          items={this.items}
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
                  id="crd-input"
                  className="group-select"
                  placeholder={this.getPlaceholder()}
                  options={this.groupSelectOptions}
                  onChange={this.toggleSelection}
                  closeMenuOnSelect={false}
                  controlShouldRenderValue={false}
                  isMulti={true}
                  formatOptionLabel={({ value, isSelected }) => (
                    <div className="flex gaps align-center">
                      <Icon small material="folder" />
                      <span>{value}</span>
                      {isSelected && (
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

export const CustomResourceDefinitions = withInjectables<Dependencies>(NonInjectedCustomResourceDefinitions, {
  getProps: (di, props) => ({
    ...props,
    selectedGroups: di.inject(selectedCustomResourceDefinitionGroupsUrlParamInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
  }),
});
