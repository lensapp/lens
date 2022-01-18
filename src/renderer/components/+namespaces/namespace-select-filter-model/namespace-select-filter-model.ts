/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observable, makeObservable, action, untracked } from "mobx";
import type { NamespaceStore } from "../namespace-store/namespace.store";
import type { SelectOption } from "../../select";
import { isMac } from "../../../../common/vars";

interface Dependencies {
  namespaceStore: NamespaceStore;
}

export class NamespaceSelectFilterModel {
  constructor(private dependencies: Dependencies) {
    makeObservable(this, {
      menuIsOpen: observable,
      closeMenu: action,
      openMenu: action,
      reset: action,
    });
  }

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

  onChange = ([{ value: namespace }]: SelectOption[]) => {
    if (namespace) {
      if (this.isMultiSelection) {
        this.dependencies.namespaceStore.toggleSingle(namespace);
      } else {
        this.dependencies.namespaceStore.selectSingle(namespace);
      }
    } else {
      this.dependencies.namespaceStore.selectAll();
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
