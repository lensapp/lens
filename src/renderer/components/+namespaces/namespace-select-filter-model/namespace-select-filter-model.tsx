/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { IComputedValue } from "mobx";
import { observable, action, computed, comparer } from "mobx";
import type { NamespaceStore } from "../store";
import type { ActionMeta, MultiValue } from "react-select";
import { Icon } from "../../icon";
import type { SelectOption } from "../../select";
import { observableCrate } from "../../../utils";
import type { IsMultiSelectionKey } from "./is-selection-key.injectable";

interface Dependencies {
  namespaceStore: NamespaceStore;
  isMultiSelectionKey: IsMultiSelectionKey;
}

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;
export type NamespaceSelectFilterOption = SelectOption<string | SelectAllNamespaces>;

export function formatOptionLabel({ value, isSelected }: NamespaceSelectFilterOption) {
  if (value === selectAllNamespaces) {
    return <>All Namespaces</>;
  }

  return (
    <div className="flex gaps align-center">
      <Icon small material="layers" />
      <span>{value}</span>
      {isSelected && (
        <Icon
          small
          material="check"
          className="box right"
          data-testid={`namespace-select-filter-option-${value}-selected`}
        />
      )}
    </div>
  );
}

export interface NamespaceSelectFilterModel {
  readonly options: IComputedValue<readonly NamespaceSelectFilterOption[]>;
  readonly menu: {
    open: () => void;
    close: () => void;
    readonly isOpen: boolean;
  };
  onChange: (newValue: MultiValue<NamespaceSelectFilterOption>, actionMeta: ActionMeta<NamespaceSelectFilterOption>) => void;
  onClick: () => void;
  onKeyDown: React.KeyboardEventHandler;
  onKeyUp: React.KeyboardEventHandler;
  reset: () => void;
}

enum SelectMenuState {
  Close = "close",
  Open = "open",
}

export function namespaceSelectFilterModelFor(dependencies: Dependencies): NamespaceSelectFilterModel {
  const { isMultiSelectionKey, namespaceStore } = dependencies;

  let didToggle = false;
  let isMultiSelection = false;
  const menuState = observableCrate(SelectMenuState.Close, [{
    from: SelectMenuState.Close,
    to: SelectMenuState.Open,
    onTransition: () => {
      optionsSortingSelected.replace(selectedNames.get());
      didToggle = false;
    },
  }]);
  const selectedNames = computed(() => new Set(namespaceStore.contextNamespaces), {
    equals: comparer.structural,
  });
  const optionsSortingSelected = observable.set(selectedNames.get());
  const options = computed((): readonly NamespaceSelectFilterOption[] => {
    const baseOptions = namespaceStore.items.map(ns => ns.getName());
    const namespaces = selectedNames.get();

    baseOptions.sort((
      (left, right) =>
        +optionsSortingSelected.has(right)
        - +optionsSortingSelected.has(left)
    ));

    return [
      {
        value: selectAllNamespaces,
        label: "All Namespaces",
        id: "all-namespaces",
        isSelected: false,
      },
      ...baseOptions.map(namespace => ({
        value: namespace,
        label: namespace,
        id: namespace,
        isSelected: namespaces.has(namespace),
      })),
    ];
  });
  const menuIsOpen = computed(() => menuState.get() === SelectMenuState.Open);

  const model: NamespaceSelectFilterModel = {
    options,
    menu: {
      close: action(() => {
        menuState.set(SelectMenuState.Close);
      }),
      open: action(() => {
        menuState.set(SelectMenuState.Open);
      }),
      get isOpen() {
        return menuIsOpen.get();
      },
    },
    onChange: (_, action) => {
      switch (action.action) {
        case "clear":
          namespaceStore.selectAll();
          break;
        case "deselect-option":
          if (typeof action.option === "string") {
            didToggle = true;
            namespaceStore.toggleSingle(action.option);
          }
          break;
        case "select-option":
          if (action.option?.value === selectAllNamespaces) {
            didToggle = true;
            namespaceStore.selectAll();
          } else if (action.option) {
            didToggle = true;

            if (isMultiSelection) {
              namespaceStore.toggleSingle(action.option.value);
            } else {
              namespaceStore.selectSingle(action.option.value);
            }
          }
          break;
      }
    },
    onClick: () => {
      if (!menuIsOpen.get()) {
        model.menu.open();
      } else if (!isMultiSelection) {
        model.menu.close();
      }
    },
    onKeyDown: (event) => {
      if (isMultiSelectionKey(event)) {
        isMultiSelection = true;
      }
    },
    onKeyUp: (event) => {
      if (isMultiSelectionKey(event)) {
        isMultiSelection = false;

        if (didToggle) {
          model.menu.close();
        }
      }
    },
    reset: action(() => {
      isMultiSelection = false;
      model.menu.close();
    }),
  };

  return model;
}
