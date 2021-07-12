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
import { observer } from "mobx-react";
import { components, PlaceholderProps } from "react-select";

import { Icon } from "../icon";
import { NamespaceSelect } from "./namespace-select";
import { namespaceStore } from "./namespace.store";

import type { SelectOption, SelectProps } from "../select";
import { isLinux, isMac, isWindows } from "../../../common/vars";
import { observable } from "mobx";

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

  onChange([{ value: namespace }]: SelectOption[]) {
    if (NamespaceSelectFilter.isMultiSelection.get() && namespace) {
      namespaceStore.toggleContext(namespace);
    } else if (!NamespaceSelectFilter.isMultiSelection.get() && namespace) {
      namespaceStore.toggleSingle(namespace);
    } else {
      namespaceStore.toggleAll(true); // "All namespaces" clicked
    }
  }

  onKeyDown = (e: React.KeyboardEvent<any>) => {
    if (isMac && e.metaKey || (isWindows || isLinux) && e.ctrlKey) {
      NamespaceSelectFilter.isMultiSelection.set(true);
    }
  };

  onKeyUp = (e: React.KeyboardEvent<any>) => {
    if (isMac && e.key === "Meta" || (isWindows || isLinux) && e.key === "Control") {
      NamespaceSelectFilter.isMultiSelection.set(false);
    }
  };

  onClick = () => {
    if (!NamespaceSelectFilter.isMultiSelection.get()) {
      NamespaceSelectFilter.isMenuOpen.set(!NamespaceSelectFilter.isMenuOpen.get());
    }
  };

  reset = () => {
    NamespaceSelectFilter.isMultiSelection.set(false);
    NamespaceSelectFilter.isMenuOpen.set(false);
  };

  render() {
    return (
      <div onKeyUp={this.onKeyUp} onKeyDown={this.onKeyDown} onClick={this.onClick}>
        <NamespaceSelect
          isMulti={true}
          menuIsOpen={NamespaceSelectFilter.isMenuOpen.get()}
          components={{ Placeholder }}
          showAllNamespacesOption={true}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          placeholder={""}
          onChange={this.onChange}
          onBlur={this.reset}
          formatOptionLabel={this.formatOptionLabel}
          className="NamespaceSelectFilter"
        />
      </div>
    );
  }
}
