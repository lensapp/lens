/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select.scss";

import React from "react";
import { observer } from "mobx-react";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import type { NamespaceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";

export interface NamespaceSelectProps extends SelectProps {
  showIcons?: boolean;
  sort?: (a: SelectOption<string>, b: SelectOption<string>) => number;
  showAllNamespacesOption?: boolean; // show "All namespaces" option on the top (default: false)
  customizeOptions?(options: SelectOption[]): SelectOption[];
}

interface Dependencies {
  namespaceStore: NamespaceStore;
}

const NonInjectedNamespaceSelect = observer(({ namespaceStore, showIcons = true, sort, showAllNamespacesOption, customizeOptions, className, ...selectProps }: Dependencies & NamespaceSelectProps) => {
  const options = (() => {
    let options: SelectOption[] = namespaceStore.items.map(ns => ({ value: ns.getName() }));

    if (sort) {
      options.sort(sort);
    }

    if (showAllNamespacesOption) {
      options.unshift({ label: "All Namespaces", value: "" });
    }

    if (customizeOptions) {
      options = customizeOptions(options);
    }

    return options;
  })();

  const formatOptionLabel = ({ value, label }: SelectOption) => (
    label || (
      <>
        {showIcons && <Icon small material="layers"/>}
        {value}
      </>
    )
  );

  return (
    <Select
      className={cssNames("NamespaceSelect", className)}
      menuClass="NamespaceSelectMenu"
      formatOptionLabel={formatOptionLabel}
      options={options}
      {...selectProps}
    />
  );
});

export const NamespaceSelect = withInjectables<Dependencies, NamespaceSelectProps>(NonInjectedNamespaceSelect, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    ...props,
  }),
});
