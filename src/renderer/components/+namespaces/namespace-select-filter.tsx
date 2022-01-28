/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select-filter.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { components, PlaceholderProps } from "react-select";
import { observable } from "mobx";
import { Icon } from "../icon";
import { NamespaceSelect } from "./namespace-select";
import type { SelectOption, SelectProps } from "../select";
import { isMac } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceFilterStoreInjectable from "./filter-store.injectable";
import type { NamespaceSelectFilterManager } from "./filter-store";

interface Dependencies {
  namespaceSelectStore: NamespaceSelectFilterManager;
}

const NonInjectedPlaceholder = observer(({ namespaceSelectStore, ...props }: Dependencies & PlaceholderProps<any, boolean>) => {
  const getPlaceholder = (): React.ReactNode => {
    const namespaces = namespaceSelectStore.contextNamespaces;

    if (namespaceSelectStore.areAllSelectedImplicitly || !namespaces.length) {
      return <>All namespaces</>;
    }

    if (namespaces.length === 1) {
      return <>Namespace: {namespaces[0]}</>;
    }

    return <>Namespaces: {namespaces.join(", ")}</>;
  };

  return (
    <components.Placeholder {...props}>
      {getPlaceholder()}
    </components.Placeholder>
  );
});

export const Placeholder = withInjectables<Dependencies, PlaceholderProps<any, boolean>>(NonInjectedPlaceholder, {
  getProps: (di, props) => ({
    namespaceSelectStore: di.inject(namespaceFilterStoreInjectable),
    ...props,
  }),
});

function isSelectionKey(e: React.KeyboardEvent): boolean {
  if (isMac) {
    return e.key === "Meta";
  }

  // windows or linux
  return e.key === "Control";
}

export interface NamespaceSelectFilterProps extends SelectProps {

}

interface Dependencies {
  namespaceSelectStore: NamespaceSelectFilterManager;
}

const NonInjectedNamespaceSelectFilter = observer(({ namespaceStore }: Dependencies & NamespaceSelectFilterProps) => {
  const [selected] = useState(observable.set<string>());
  const [didToggle, setDidToggle] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      selected.replace(namespaceStore.selectedNames);
      setDidToggle(false);
    }
  }, [isOpen]);

  const formatOptionLabel = ({ value: namespace, label }: SelectOption) => {
    if (namespace) {
      const isSelected = namespaceStore.hasContext(namespace);

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
  const onChange = ([{ value: namespace }]: SelectOption[]) => {
    if (namespace) {
      if (isMultiSelect) {
        setDidToggle(true);
        namespaceStore.toggleSingle(namespace);
      } else {
        namespaceStore.selectSingle(namespace);
      }
    } else {
      namespaceStore.selectAll();
    }
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isSelectionKey(e)) {
      setIsMultiSelect(true);
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (isSelectionKey(e)) {
      setIsMultiSelect(false);
    }

    if (!isMultiSelect && didToggle) {
      setIsOpen(false);
    }
  };
  const onClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!isMultiSelect) {
      setIsOpen(!isOpen);
    }
  };
  const reset = () => {
    setIsMultiSelect(false);
    setIsOpen(false);
  };

  return (
    <div onKeyUp={onKeyUp} onKeyDown={onKeyDown} onClick={onClick}>
      <NamespaceSelect
        isMulti={true}
        menuIsOpen={isOpen}
        components={{ Placeholder }}
        showAllNamespacesOption={true}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        placeholder={""}
        onChange={onChange}
        onBlur={reset}
        formatOptionLabel={formatOptionLabel}
        className="NamespaceSelectFilter"
        menuClass="NamespaceSelectFilterMenu"
        sort={(left, right) => +selected.has(right.value) - +selected.has(left.value)}
      />
    </div>
  );
});

export const NamespaceSelectFilter = withInjectables<Dependencies, NamespaceSelectFilterProps>(NonInjectedNamespaceSelectFilter, {
  getProps: (di, props) => ({
    namespaceSelectStore: di.inject(namespaceFilterStoreInjectable),
    ...props,
  }),
});
