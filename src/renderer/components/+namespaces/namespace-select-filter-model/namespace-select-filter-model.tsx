/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observable, action, untracked, computed } from "mobx";
import type { NamespaceStore } from "../store";
import { isMac } from "../../../../common/vars";
import type { ActionMeta } from "react-select";
import { Icon } from "../../icon";
import type { SelectOption } from "../../select";

interface Dependencies {
  readonly namespaceStore: NamespaceStore;
}

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;

export type NamespaceSelectFilterOption = SelectOption<string | SelectAllNamespaces>;

export class NamespaceSelectFilterModel {
  constructor(private readonly dependencies: Dependencies) {}

  readonly options = computed((): readonly NamespaceSelectFilterOption[] => {
    const baseOptions = this.dependencies.namespaceStore.items.map(ns => ns.getName());

    baseOptions.sort((
      (left, right) =>
        +this.selectedNames.has(right)
        - +this.selectedNames.has(left)
    ));

    return [
      {
        value: selectAllNamespaces,
        label: "All Namespaces",
        isSelected: false,
      },
      ...baseOptions.map(namespace => ({
        value: namespace,
        label: namespace,
        isSelected: this.selectedNames.has(namespace),
      })),
    ];
  });

  formatOptionLabel = ({ value, isSelected }: NamespaceSelectFilterOption) => {
    if (value === selectAllNamespaces) {
      return "All Namespaces";
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
          />
        )}
      </div>
    );
  };

  readonly menuIsOpen = observable.box(false);

  closeMenu = action(() => {
    this.menuIsOpen.set(false);
  });

  openMenu = action(() => {
    this.menuIsOpen.set(true);
  });

  get selectedNames() {
    return untracked(() => this.dependencies.namespaceStore.selectedNames);
  }

  isSelected = (namespace: string | string[]) =>
    this.dependencies.namespaceStore.hasContext(namespace);

  selectSingle = (namespace: string) => {
    this.dependencies.namespaceStore.selectSingle(namespace);
  };

  selectAll = () => {
    this.dependencies.namespaceStore.selectAll();
  };

  onChange = (namespace: unknown, action: ActionMeta<NamespaceSelectFilterOption>) => {
    switch (action.action) {
      case "clear":
        this.dependencies.namespaceStore.selectAll();
        break;
      case "deselect-option":
        if (typeof action.option === "string") {
          this.dependencies.namespaceStore.toggleSingle(action.option);
        }
        break;
      case "select-option":
        if (action.option?.value === selectAllNamespaces) {
          this.dependencies.namespaceStore.selectAll();
        } else if (action.option) {
          if (this.isMultiSelection) {
            this.dependencies.namespaceStore.toggleSingle(action.option.value);
          } else {
            this.dependencies.namespaceStore.selectSingle(action.option.value);
          }
        }
        break;
    }
  };

  onClick = () => {
    if (!this.menuIsOpen) {
      this.openMenu();
    } else if (!this.isMultiSelection) {
      this.closeMenu();
    }
  };

  private isMultiSelection = false;

  onKeyDown = (event: React.KeyboardEvent) => {
    if (isSelectionKey(event)) {
      this.isMultiSelection = true;
    }
  };

  onKeyUp = (event: React.KeyboardEvent) => {
    if (isSelectionKey(event)) {
      this.isMultiSelection = false;
    }
  };

  reset = action(() => {
    this.isMultiSelection = false;
    this.closeMenu();
  });
}

const isSelectionKey = (event: React.KeyboardEvent): boolean  => {
  if (isMac) {
    return event.key === "Meta";
  }

  return event.key === "Control"; // windows or linux
};
