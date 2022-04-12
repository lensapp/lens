/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select-filter.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PlaceholderProps } from "react-select";
import { components } from "react-select";
import type { NamespaceStore } from "./namespace-store/namespace.store";
import { Select } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { NamespaceSelectFilterModel, NamespaceSelectFilterOption, SelectAllNamespaces } from "./namespace-select-filter-model/namespace-select-filter-model";
import namespaceSelectFilterModelInjectable from "./namespace-select-filter-model/namespace-select-filter-model.injectable";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";

interface NamespaceSelectFilterProps {
  id: string;
}

interface Dependencies {
  model: NamespaceSelectFilterModel;
}

const NonInjectedNamespaceSelectFilter = observer(({ model, id }: Dependencies & NamespaceSelectFilterProps) => {
  return (
    <div
      onKeyUp={model.onKeyUp}
      onKeyDown={model.onKeyDown}
      onClick={model.onClick}
    >
      <Select<{ namespace: string | SelectAllNamespaces }, true>
        id={id}
        isMulti={true}
        isClearable={false}
        menuIsOpen={model.menuIsOpen}
        components={{ Placeholder }}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        onChange={model.onChange}
        onBlur={model.reset}
        formatOptionLabel={model.formatOptionLabel}
        getOptionLabel={model.getOptionLabel}
        options={model.options.get()}
        className="NamespaceSelect NamespaceSelectFilter"
        menuClass="NamespaceSelectFilterMenu"
      />
    </div>
  );
});

export const NamespaceSelectFilter = withInjectables<Dependencies, NamespaceSelectFilterProps>(NonInjectedNamespaceSelectFilter, {
  getProps: (di, props) => ({
    model: di.inject(namespaceSelectFilterModelInjectable),
    ...props,
  }),
});

export interface CustomPlaceholderProps extends PlaceholderProps<NamespaceSelectFilterOption, boolean> {}

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
});

const Placeholder = withInjectables<PlaceholderDependencies, CustomPlaceholderProps>( NonInjectedPlaceholder, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    ...props,
  }),
});
