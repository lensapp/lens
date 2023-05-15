/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { IComputedValue } from "mobx";
import { observable, action, computed, comparer } from "mobx";
import type { NamespaceStore } from "../store";
import type { ActionMeta, MultiValue } from "react-select";
import { Icon } from "@k8slens/icon";
import type { SelectOption } from "../../select";
import { observableCrate } from "@k8slens/utilities";
import type { IsMultiSelectionKey } from "./is-selection-key.injectable";
import type { ClusterContext } from "../../../cluster-frame-context/cluster-frame-context";

interface Dependencies {
  context: ClusterContext;
  namespaceStore: NamespaceStore;
  isMultiSelectionKey: IsMultiSelectionKey;
}

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;
export type NamespaceSelectFilterOption = SelectOption<string | SelectAllNamespaces>;

export interface NamespaceSelectFilterModel {
  readonly options: IComputedValue<readonly NamespaceSelectFilterOption[]>;
  readonly menu: {
    open: () => void;
    close: () => void;
    readonly isOpen: IComputedValue<boolean>;
  };
  onChange: (newValue: MultiValue<NamespaceSelectFilterOption>, actionMeta: ActionMeta<NamespaceSelectFilterOption>) => void;
  onClick: () => void;
  onKeyDown: React.KeyboardEventHandler;
  onKeyUp: React.KeyboardEventHandler;
  reset: () => void;
  isOptionSelected: (option: NamespaceSelectFilterOption) => boolean;
  formatOptionLabel: (option: NamespaceSelectFilterOption) => JSX.Element;
}

enum SelectMenuState {
  Close = "close",
  Open = "open",
}

export function namespaceSelectFilterModelFor(dependencies: Dependencies): NamespaceSelectFilterModel {
  const { isMultiSelectionKey, namespaceStore, context } = dependencies;

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
  const selectedNames = computed(() => new Set(context.contextNamespaces), {
    equals: comparer.structural,
  });
  const optionsSortingSelected = observable.set(selectedNames.get());
  const sortNamespacesByIfTheyHaveBeenSelected = (left: string, right: string) => {
    const isLeftSelected = optionsSortingSelected.has(left);
    const isRightSelected = optionsSortingSelected.has(right);

    if (isLeftSelected === isRightSelected) {
      return 0;
    }

    return isRightSelected
      ? 1
      : -1;
  };
  const options = computed((): readonly NamespaceSelectFilterOption[] => [
    {
      value: selectAllNamespaces,
      label: "All Namespaces",
      id: "all-namespaces",
    },
    ...context
      .allNamespaces
      .sort(sortNamespacesByIfTheyHaveBeenSelected)
      .map(namespace => ({
        value: namespace,
        label: namespace,
        id: namespace,
      })),
  ]);
  const menuIsOpen = computed(() => menuState.get() === SelectMenuState.Open);
  const isOptionSelected: NamespaceSelectFilterModel["isOptionSelected"] = (option) => {
    if (option.value === selectAllNamespaces) {
      return false;
    }

    return selectedNames.get().has(option.value);
  };

  const model: NamespaceSelectFilterModel = {
    options,
    menu: {
      close: action(() => {
        menuState.set(SelectMenuState.Close);
      }),
      open: action(() => {
        menuState.set(SelectMenuState.Open);
      }),
      isOpen: menuIsOpen,
    },
    onChange: (_, action) => {
      switch (action.action) {
        case "clear":
          namespaceStore.selectAll();
          break;
        case "deselect-option":
        case "select-option":
          if (action.option) {
            didToggle = true;

            if (action.option.value === selectAllNamespaces) {
              namespaceStore.selectAll();
            } else if (isMultiSelection) {
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
    isOptionSelected,
    formatOptionLabel: (option) => {
      if (option.value === selectAllNamespaces) {
        return <>All Namespaces</>;
      }

      return (
        <div className="flex gaps align-center">
          <Icon small material="layers" />
          <span>{option.value}</span>
          {isOptionSelected(option) && (
            <Icon
              small
              material="check"
              className="box right"
              data-testid={`namespace-select-filter-option-${option.value}-selected`}
            />
          )}
        </div>
      );
    },
  };

  return model;
}
