/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select.scss";

import React, { useEffect, useState } from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import type { SelectProps } from "../select";
import { Select } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import type { NamespaceStore } from "./namespace-store/namespace.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";

export type NamespaceSelectSort = (left: string, right: string) => number;

export interface NamespaceSelectProps<IsMulti extends boolean> extends SelectProps<string, IsMulti> {
  showIcons?: boolean;
  sort?: NamespaceSelectSort;
  options?: undefined;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
}

export function formatNamespaceOptionWithIcon(namespace: string) {
  return (
    <>
      <Icon small material="layers" />
      {namespace}
    </>
  );
}

function getOptions(namespaceStore: NamespaceStore, sort: NamespaceSelectSort | undefined) {
  return computed(() => {
    const baseOptions = namespaceStore.items.map(ns => ns.getName());

    if (sort) {
      baseOptions.sort(sort);
    }

    return baseOptions;
  });
}

const NonInjectedNamespaceSelect = observer(({
  namespaceStore,
  showIcons,
  formatOptionLabel,
  sort,
  className,
  ...selectProps
}: Dependencies & NamespaceSelectProps<boolean>) => {
  const [baseOptions, setBaseOptions] = useState(getOptions(namespaceStore, sort));

  useEffect(() => setBaseOptions(getOptions(namespaceStore, sort)), [sort]);

  return (
    <Select
      className={cssNames("NamespaceSelect", className)}
      menuClass="NamespaceSelectMenu"
      formatOptionLabel={showIcons ? formatNamespaceOptionWithIcon : undefined}
      options={baseOptions.get()}
      {...selectProps}
    />
  );
});

const InjectedNamespaceSelect = withInjectables<Dependencies, NamespaceSelectProps<boolean>>(NonInjectedNamespaceSelect, {
  getProps: (di, props) => ({
    ...props,
    namespaceStore: di.inject(namespaceStoreInjectable),
  }),
});

export function NamespaceSelect<IsMulti extends boolean = false>(props: NamespaceSelectProps<IsMulti>): JSX.Element {
  return <InjectedNamespaceSelect {...(props as never)} />;
}
