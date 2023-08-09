/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "../namespaces/store.injectable";
import isMultiSelectionKeyInjectable from "./is-selection-key.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import type { IComputedValue, IObservableValue } from "mobx";
import { action, comparer, computed, observable } from "mobx";
import GlobToRegExp from "glob-to-regexp";
import { observableCrate } from "@k8slens/utilities";


export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;
export interface NamespaceSelectFilterOption {
  value: string | SelectAllNamespaces;
  label: string;
  id: string | SelectAllNamespaces;
}

export interface NamespaceSelectFilterModel {
  readonly options: IComputedValue<NamespaceSelectFilterOption[]>;
  readonly filteredOptions: IComputedValue<NamespaceSelectFilterOption[]>;
  readonly selectedOptions: IComputedValue<NamespaceSelectFilterOption[]>;
  readonly menu: {
    open: () => void;
    close: () => void;
    toggle: () => void;
    readonly isOpen: IComputedValue<boolean>;
    readonly hasSelectedAll: IComputedValue<boolean>;
    onKeyDown: React.KeyboardEventHandler;
    onKeyUp: React.KeyboardEventHandler;
  };
  readonly input: {
    onKeyDown: React.KeyboardEventHandler;
  };
  onClick: (options: NamespaceSelectFilterOption) => void;
  deselect: (namespace: string) => void;
  select: (namespace: string) => void;
  readonly filterText: IObservableValue<string>;
  reset: () => void;
  isOptionSelected: (option: NamespaceSelectFilterOption) => boolean;
}

enum SelectMenuState {
  Close = "close",
  Open = "open",
}

const filterBasedOnText = (filterText: string) => {
  const regexp = new RegExp(GlobToRegExp(filterText, { extended: true, flags: "gi" }));

  return (options: NamespaceSelectFilterOption) => {
    if (options.value === selectAllNamespaces) {
      return true;
    }

    return Boolean(options.value.match(regexp));
  };
};

const namespaceSelectFilterModelInjectable = getInjectable({
  id: "namespace-select-filter-model",

  instantiate: (di) => {
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const isMultiSelectionKey = di.inject(isMultiSelectionKeyInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);

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
    const filterText = observable.box("");
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
    const options = computed((): NamespaceSelectFilterOption[] => [
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
    const filteredOptions = computed(() => options.get().filter(filterBasedOnText(filterText.get())));
    const selectedOptions = computed(() => options.get().filter(model.isOptionSelected));
    const menuIsOpen = computed(() => menuState.get() === SelectMenuState.Open);
    const isOptionSelected: NamespaceSelectFilterModel["isOptionSelected"] = (option) => {
      if (option.value === selectAllNamespaces) {
        return false;
      }

      return selectedNames.get().has(option.value);
    };

    const model: NamespaceSelectFilterModel = {
      options,
      filteredOptions,
      selectedOptions,
      menu: {
        close: action(() => {
          menuState.set(SelectMenuState.Close);
          filterText.set("");
        }),
        open: action(() => {
          menuState.set(SelectMenuState.Open);
        }),
        toggle: () => {
          if (menuIsOpen.get()) {
            model.menu.close();
          } else {
            model.menu.open();
          }
        },
        isOpen: menuIsOpen,
        hasSelectedAll: computed(() => namespaceStore.areAllSelectedImplicitly),
        onKeyDown: (event) => {
          if (isMultiSelectionKey(event)) {
            isMultiSelection = true;
          } else if (event.key === "Escape") {
            model.menu.close();
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
      },
      input: {
        onKeyDown: (event) => {
          if (event.key === "Enter") {
            const options = filteredOptions.get().slice(1);

            if (options.length >= 1) {
              model.onClick(options[0]);
            }
          }
        },
      },
      onClick: action((option) => {
        if (option.value === selectAllNamespaces) {
          namespaceStore.selectAll();
          model.menu.close();
        } else if (isMultiSelection) {
          didToggle = true;
          namespaceStore.toggleSingle(option.value);
        } else {
          namespaceStore.selectSingle(option.value);
          model.menu.close();
        }
      }),
      deselect: action((namespace) => {
        namespaceStore.deselectSingle(namespace);
      }),
      select: action((namespace) => {
        namespaceStore.includeSingle(namespace);
      }),
      filterText,
      reset: action(() => {
        isMultiSelection = false;
        model.menu.close();
      }),
      isOptionSelected,
    };

    return model;
  },
});

export default namespaceSelectFilterModelInjectable;
