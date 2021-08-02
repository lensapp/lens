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

import "./namespace-select-filter.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { components, PlaceholderProps } from "react-select";
import { action, computed, makeObservable, observable, reaction } from "mobx";

import { Icon } from "../icon";
import { NamespaceSelect } from "./namespace-select";
import { namespaceStore } from "./namespace.store";

import type { SelectOption, SelectProps } from "../select";
import { isMac } from "../../../common/vars";

const Placeholder = observer((props: PlaceholderProps<any, boolean>) => {
  const getPlaceholder = (): React.ReactNode => {
    const namespaces = namespaceStore.contextNamespaces;

    switch (namespaces.length) {
      case 0:
      case namespaceStore.allowedNamespaces.length:
        return <>All namespaces</>;
      case 1:
        return <>Namespace: {namespaces[0]}</>;
      default:
        return <>Namespaces: {namespaces.join(", ")}</>;
    }
  };

  return (
    <components.Placeholder {...props}>
      {getPlaceholder()}
    </components.Placeholder>
  );
});

@observer
export class NamespaceSelectFilter extends React.Component<SelectProps> {
  static isMultiSelection = observable.box(false);
  static isMenuOpen = observable.box(false);

  private selected = observable.set<string>();
  private didToggle = false;

  constructor(props: SelectProps) {
    super(props);
    makeObservable(this);
  }

  @computed get isMultiSelection() {
    return NamespaceSelectFilter.isMultiSelection.get();
  }

  set isMultiSelection(val: boolean) {
    NamespaceSelectFilter.isMultiSelection.set(val);
  }

  @computed get isMenuOpen() {
    return NamespaceSelectFilter.isMenuOpen.get();
  }

  set isMenuOpen(val: boolean) {
    NamespaceSelectFilter.isMenuOpen.set(val);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.isMenuOpen, newVal => {
        if (newVal) { // rising edge of selection
          this.selected.replace(namespaceStore.selectedNamespaces);
          this.didToggle = false;
        }
      }),
    ]);
  }

  formatOptionLabel({ value: namespace, label }: SelectOption) {
    if (namespace) {
      const isSelected = namespaceStore.hasContext(namespace);

      return (
        <div className="flex gaps align-center">
          <Icon small material="layers"/>
          <span>{namespace}</span>
          {isSelected && <Icon small material="check" className="box right"/>}
        </div>
      );
    }

    return label;
  }

  @action
  onChange = ([{ value: namespace }]: SelectOption[]) => {
    if (namespace) {
      if (this.isMultiSelection) {
        this.didToggle = true;
        namespaceStore.toggleContext(namespace);
      } else {
        namespaceStore.toggleSingle(namespace);
      }
    } else {
      namespaceStore.toggleAll(true); // "All namespaces" clicked
    }
  };

  private isSelectionKey(e: React.KeyboardEvent): boolean {
    if (isMac) {
      return e.key === "Meta";
    }

    return e.key === "Control"; // windows or linux
  }

  @action
  onKeyDown = (e: React.KeyboardEvent) => {
    if (this.isSelectionKey(e)) {
      this.isMultiSelection = true;
    }
  };

  @action
  onKeyUp = (e: React.KeyboardEvent) => {
    if (this.isSelectionKey(e)) {
      this.isMultiSelection = false;
    }

    if (!this.isMultiSelection && this.didToggle) {
      this.isMenuOpen = false;
    }
  };

  @action
  onClick = () => {
    if (!this.isMenuOpen) {
      this.isMenuOpen = true;
    } else if (!this.isMultiSelection) {
      this.isMenuOpen = !this.isMenuOpen;
    }
  };

  reset = () => {
    this.isMultiSelection = false;
    this.isMenuOpen = false;
  };

  render() {
    return (
      <div onKeyUp={this.onKeyUp} onKeyDown={this.onKeyDown} onClick={this.onClick}>
        <NamespaceSelect
          isMulti={true}
          menuIsOpen={this.isMenuOpen}
          components={{ Placeholder }}
          showAllNamespacesOption={true}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          placeholder={""}
          onChange={this.onChange}
          onBlur={this.reset}
          formatOptionLabel={this.formatOptionLabel}
          className="NamespaceSelectFilter"
          sort={(left, right) => +this.selected.has(right.value) - +this.selected.has(left.value)}
        />
      </div>
    );
  }
}
