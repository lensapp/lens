/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select.scss";

import React, { useEffect, useState } from "react";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { observer } from "mobx-react";
import type { SelectProps } from "../select";
import { Select } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespacesInjectable from "./namespaces.injectable";

export type NamespaceSelectSort = (left: string, right: string) => number;

export interface NamespaceSelectProps<IsMulti extends boolean> extends Omit<SelectProps<string, { value: string; label: string }, IsMulti>, "options" | "value"> {
  showIcons?: boolean;
  sort?: NamespaceSelectSort;
  value: string | null | undefined;
}

interface Dependencies {
  namespaces: IComputedValue<string[]>;
}

function getOptions(namespaces: IComputedValue<string[]>, sort: NamespaceSelectSort | undefined) {
  return computed(() => {
    const baseOptions = namespaces.get();

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
  namespaces,
  showIcons,
  formatOptionLabel,
  sort,
  className,
  ...selectProps
}: Dependencies & NamespaceSelectProps<boolean>) => {
  const [baseOptions, setBaseOptions] = useState(getOptions(namespaces, sort));

  useEffect(() => setBaseOptions(getOptions(namespaces, sort)), [sort]);

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
    namespaces: di.inject(namespacesInjectable),
  }),
});

export function NamespaceSelect<IsMulti extends boolean = false>(props: NamespaceSelectProps<IsMulti>): JSX.Element {
  return <InjectedNamespaceSelect {...(props as unknown as NamespaceSelectProps<boolean>)} />;
}
