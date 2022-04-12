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

export interface NamespaceSelectProps<IsMulti extends boolean> extends Omit<SelectProps<{ namespace: string }, IsMulti>, "options" | "value"> {
  showIcons?: boolean;
  sort?: NamespaceSelectSort;
  value: string | null;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
}

function getOptions(namespaceStore: NamespaceStore, sort: NamespaceSelectSort | undefined) {
  return computed(() => {
    const baseOptions = namespaceStore.items.map(ns => ns.getName());

    if (sort) {
      baseOptions.sort(sort);
    }

    return baseOptions.map(namespace => ({ namespace }));
  });
}

const NonInjectedNamespaceSelect = observer(({
  namespaceStore,
  showIcons,
  formatOptionLabel,
  sort,
  className,
  value,
  ...selectProps
}: Dependencies & NamespaceSelectProps<boolean>) => {
  const [baseOptions, setBaseOptions] = useState(getOptions(namespaceStore, sort));

  useEffect(() => setBaseOptions(getOptions(namespaceStore, sort)), [sort]);

  return (
    <Select
      className={cssNames("NamespaceSelect", className)}
      menuClass="NamespaceSelectMenu"
      formatOptionLabel={showIcons
        ? ({ namespace }) => (
          <>
            <Icon small material="layers" />
            {namespace}
          </>
        )
        : undefined
      }
      getOptionLabel={({ namespace }) => namespace}
      value={value ? ({ namespace: value }) : null}
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
