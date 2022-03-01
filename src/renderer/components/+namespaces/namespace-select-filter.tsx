/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select-filter.scss";

import React from "react";
import { observer } from "mobx-react";
import { components, OptionTypeBase, PlaceholderProps } from "react-select";

import { Icon } from "../icon";
import { NamespaceSelect } from "./namespace-select";
import type { NamespaceStore } from "./namespace-store/namespace.store";

import type { SelectOption, SelectProps } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { NamespaceSelectFilterModel } from "./namespace-select-filter-model/namespace-select-filter-model";
import namespaceSelectFilterModelInjectable from "./namespace-select-filter-model/namespace-select-filter-model.injectable";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";

interface Dependencies {
  model: NamespaceSelectFilterModel;
}

const NonInjectedNamespaceSelectFilter = observer(({ model }: SelectProps & Dependencies) => (
  <div
    onKeyUp={model.onKeyUp}
    onKeyDown={model.onKeyDown}
    onClick={model.onClick}
  >
    <NamespaceSelect
      isMulti={true}
      menuIsOpen={model.menuIsOpen}
      components={{ Placeholder }}
      showAllNamespacesOption={true}
      closeMenuOnSelect={false}
      controlShouldRenderValue={false}
      placeholder={""}
      onChange={model.onChange}
      onBlur={model.reset}
      formatOptionLabel={formatOptionLabelFor(model)}
      className="NamespaceSelectFilter"
      menuClass="NamespaceSelectFilterMenu"
      sort={(left, right) =>
        +model.selectedNames.has(right.value)
        - +model.selectedNames.has(left.value)
      }
    />
  </div>
));


const formatOptionLabelFor =
  (model: NamespaceSelectFilterModel) =>
    ({ value: namespace, label }: SelectOption) => {
      if (namespace) {
        const isSelected = model.isSelected(namespace);

        return (
          <div className="flex gaps align-center">
            <Icon small material="layers" />
            <span>{namespace}</span>
            {isSelected && <Icon small material="check" className="box right" />}
          </div>
        );
      }

      return label;
    };

export const NamespaceSelectFilter = withInjectables<Dependencies, SelectProps>(NonInjectedNamespaceSelectFilter, {
  getProps: (di, props) => ({
    model: di.inject(namespaceSelectFilterModelInjectable),
    ...props,
  }),
});

export interface CustomPlaceholderProps extends PlaceholderProps<OptionTypeBase, boolean> {}

interface PlaceholderDependencies {
  namespaceStore: NamespaceStore;
}

const NonInjectedPlaceholder = observer(({ namespaceStore, ...props }: CustomPlaceholderProps & PlaceholderDependencies) => {
  const getPlaceholder = () => {
    const namespaces = namespaceStore.contextNamespaces;

    if (namespaceStore.areAllSelectedImplicitly || namespaces.length === 0) {
      return "All namespaces";
    }

    const prefix = namespaces.length === 1
      ? "Namespace"
      : "Namespaces";

    return `${prefix}: ${namespaces.join(", ")}`;
  };

  return (
    <components.Placeholder {...props}>
      {getPlaceholder()}
    </components.Placeholder>
  );
},
);

const Placeholder = withInjectables<PlaceholderDependencies, CustomPlaceholderProps>( NonInjectedPlaceholder, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    ...props,
  }),
});
