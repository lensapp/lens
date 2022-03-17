/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observable, makeObservable, action, untracked, computed } from "mobx";
import type { NamespaceStore } from "../namespace-store/namespace.store";
import { isMac } from "../../../../common/vars";
import type { ActionMeta } from "react-select";
import { Icon } from "../../icon";

interface Dependencies {
  readonly namespaceStore: NamespaceStore;
}

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;

export class NamespaceSelectFilterModel {
  constructor(private readonly dependencies: Dependencies) {
    makeObservable(this, {
      menuIsOpen: observable,
      closeMenu: action,
      openMenu: action,
      reset: action,
    });
  }

  readonly options = computed(() => {
    const baseOptions = this.dependencies.namespaceStore.items.map(ns => ns.getName());

    baseOptions.sort((
      (left, right) =>
        +this.selectedNames.has(right)
        - +this.selectedNames.has(left)
    ));

    return [selectAllNamespaces, ...baseOptions] as const;
  });

  formatOptionLabel = (option: string | SelectAllNamespaces) => {
    if (option === selectAllNamespaces) {
      return "All Namespaces";
    }

    const isSelected = this.isSelected(option);

    return (
      <div className="flex gaps align-center">
        <Icon small material="layers" />
        <span>{option}</span>
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

  getOptionLabel = (option: string | SelectAllNamespaces) => {
    if (option === selectAllNamespaces) {
      return "All Namespaces";
    }

    return option;
  };

  menuIsOpen = false;

  closeMenu = () => {
    this.menuIsOpen = false;
  };

  openMenu = () => {
    this.menuIsOpen = true;
  };

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

  onChange = (namespace: unknown, action: ActionMeta<string | SelectAllNamespaces>) => {
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
        if (action.option === selectAllNamespaces) {
          this.dependencies.namespaceStore.selectAll();
        } else if (action.option) {
          if (this.isMultiSelection) {
            this.dependencies.namespaceStore.toggleSingle(action.option);
          } else {
            this.dependencies.namespaceStore.selectSingle(action.option);
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

  reset = () => {
    this.isMultiSelection = false;
    this.closeMenu();
  };
}

const isSelectionKey = (event: React.KeyboardEvent): boolean  => {
  if (isMac) {
    return event.key === "Meta";
  }

  return event.key === "Control"; // windows or linux
};
