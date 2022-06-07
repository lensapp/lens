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
import type { NamespaceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";

export type NamespaceSelectSort = (left: string, right: string) => number;

export interface NamespaceSelectProps<IsMulti extends boolean> extends Omit<SelectProps<string, { value: string; label: string }, IsMulti>, "options" | "value"> {
  showIcons?: boolean;
  sort?: NamespaceSelectSort;
  value: string | null | undefined;
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

    return baseOptions.map(namespace => ({
      value: namespace,
      label: namespace,
    }));
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
      formatOptionLabel={showIcons
        ? ({ value }) => (
          <>
            <Icon small material="layers" />
            {value}
          </>
        )
        : undefined
      }
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
