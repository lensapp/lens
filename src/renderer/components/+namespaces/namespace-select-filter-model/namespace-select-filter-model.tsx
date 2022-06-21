/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observable, action, computed, makeObservable, comparer, reaction } from "mobx";
import type { NamespaceStore } from "../store";
import type { ActionMeta } from "react-select";
import { Icon } from "../../icon";
import type { SelectOption } from "../../select";
import { autoBind } from "../../../utils";

interface Dependencies {
  readonly namespaceStore: NamespaceStore;
  readonly isMac: boolean;
}

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type SelectAllNamespaces = typeof selectAllNamespaces;
export type NamespaceSelectFilterOption = SelectOption<string | SelectAllNamespaces>;

export class NamespaceSelectFilterModel {
  private isSelectionKey = (event: React.KeyboardEvent): boolean  => {
    if (this.dependencies.isMac) {
      return event.key === "Meta";
    }

    return event.key === "Control"; // windows or linux
  };

  constructor(private readonly dependencies: Dependencies) {
    makeObservable(this);
    autoBind(this);

    reaction(
      () => this.menuIsOpen.get(),
      (isOpen) => {
        if (!isOpen) { // falling edge of menu being open
          this.optionsSortingSelected.replace(this.selectedNames.get());
        }
      },
    );
  }

  readonly menuIsOpen = observable.box(false);

  private readonly selectedNames = computed(() => new Set(this.dependencies.namespaceStore.contextNamespaces), {
    equals: comparer.structural,
  });

  /**
   * This set is only updated on the falling edge of the menu being open. That way while the menu is
   * open the order of the items doesn't change
   */
  private readonly optionsSortingSelected = observable.set<string>(this.selectedNames.get());

  readonly options = computed((): readonly NamespaceSelectFilterOption[] => {
    const baseOptions = this.dependencies.namespaceStore.items.map(ns => ns.getName());
    const selectedNames = this.selectedNames.get();

    baseOptions.sort((
      (left, right) =>
        +this.optionsSortingSelected.has(right)
        - +this.optionsSortingSelected.has(left)
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
        isSelected: selectedNames.has(namespace),
      })),
    ];
  });

  formatOptionLabel({ value, isSelected }: NamespaceSelectFilterOption) {
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
  }

  @action
  closeMenu() {
    this.menuIsOpen.set(false);
  }

  @action
  openMenu(){
    this.menuIsOpen.set(true);
  }

  isSelected(namespace: string | string[]) {
    return this.dependencies.namespaceStore.hasContext(namespace);
  }

  selectSingle(namespace: string) {
    this.dependencies.namespaceStore.selectSingle(namespace);
  }

  selectAll() {
    this.dependencies.namespaceStore.selectAll();
  }

  onChange(namespace: unknown, action: ActionMeta<NamespaceSelectFilterOption>) {
    switch (action.action) {
      case "clear":
        this.dependencies.namespaceStore.selectAll();
        break;
      case "deselect-option":
        if (typeof action.option === "string") {
          this.didToggle = true;
          this.dependencies.namespaceStore.toggleSingle(action.option);
        }
        break;
      case "select-option":
        if (action.option?.value === selectAllNamespaces) {
          this.didToggle = true;
          this.dependencies.namespaceStore.selectAll();
        } else if (action.option) {
          this.didToggle = true;

          if (this.isMultiSelection) {
            this.dependencies.namespaceStore.toggleSingle(action.option.value);
          } else {
            this.dependencies.namespaceStore.selectSingle(action.option.value);
          }
        }
        break;
    }
  }

  onClick() {
    if (!this.menuIsOpen.get()) {
      this.openMenu();
    } else if (!this.isMultiSelection) {
      this.closeMenu();
    }
  }

  private isMultiSelection = false;

  onKeyDown(event: React.KeyboardEvent) {
    if (this.isSelectionKey(event)) {
      this.isMultiSelection = true;
    }
  }

  private didToggle = false;

  onKeyUp(event: React.KeyboardEvent) {
    if (this.isSelectionKey(event)) {
      this.isMultiSelection = false;

      if (this.didToggle) {
        this.closeMenu();
      }
    }
  }

  @action
  reset() {
    this.isMultiSelection = false;
    this.closeMenu();
  }
}
