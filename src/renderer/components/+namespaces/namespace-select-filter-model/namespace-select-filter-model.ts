/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
