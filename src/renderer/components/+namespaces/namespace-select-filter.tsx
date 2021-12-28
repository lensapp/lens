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
import { action, makeObservable, observable, reaction } from "mobx";

import { Icon } from "../icon";
import { NamespaceSelect } from "./namespace-select";
import type { NamespaceStore } from "./namespace-store/namespace.store";

import type { SelectOption, SelectProps } from "../select";
import { isMac } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";
import type { NamespaceSelectFilterModel } from "./namespace-select-filter-model/namespace-select-filter-model";
import namespaceSelectFilterModelInjectable from "./namespace-select-filter-model/namespace-select-filter-model.injectable";

interface Dependencies {
  model: NamespaceSelectFilterModel,
  namespaceStore: NamespaceStore
}

@observer
class NonInjectedNamespaceSelectFilter extends React.Component<SelectProps & Dependencies> {

  /**
   * Only updated on every open
   */
  private selected = observable.set<string>();
  private didToggle = false;

  constructor(props: SelectProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get model() {
    return this.props.model;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.model.menuIsOpen, newVal => {
        if (newVal) { // rising edge of selection
          this.selected.replace(this.props.namespaceStore.selectedNames);
          this.didToggle = false;
        }
      }),
    ]);
  }

  formatOptionLabel({ value: namespace, label }: SelectOption) {
    if (namespace) {
      const isSelected = this.props.namespaceStore.hasContext(namespace);

      return (
        <div className="flex gaps align-center">
          <Icon small material="layers" />
          <span>{namespace}</span>
          {isSelected && <Icon small material="check" className="box right" />}
        </div>
      );
    }

    return label;
  }

  @action
  onChange = ([{ value: namespace }]: SelectOption[]) => {
    if (namespace) {
      if (this.model.isMultiSelection) {
        this.didToggle = true;
        this.props.namespaceStore.toggleSingle(namespace);
      } else {
        this.props.namespaceStore.selectSingle(namespace);
      }
    } else {
      this.props.namespaceStore.selectAll();
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
      this.model.setIsMultiSelection(true);
    }
  };

  @action
  onKeyUp = (e: React.KeyboardEvent) => {
    if (this.isSelectionKey(e)) {
      this.model.setIsMultiSelection(false);
    }

    if (!this.model.isMultiSelection && this.didToggle) {
      this.model.closeMenu();
    }
  };

  @action
  onClick = () => {
    if (!this.model.menuIsOpen) {
      this.model.openMenu();
    } else if (!this.model.isMultiSelection) {
      this.model.toggleMenu();
    }
  };

  reset = () => {
    this.model.setIsMultiSelection(true);
    this.model.closeMenu();
  };

  render() {
    return (
      <div onKeyUp={this.onKeyUp} onKeyDown={this.onKeyDown} onClick={this.onClick}>
        <NamespaceSelect
          isMulti={true}
          menuIsOpen={this.model.menuIsOpen}
          components={{ Placeholder }}
          showAllNamespacesOption={true}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          placeholder={""}
          onChange={this.onChange}
          onBlur={this.reset}
          formatOptionLabel={this.formatOptionLabel}
          className="NamespaceSelectFilter"
          menuClass="NamespaceSelectFilterMenu"
          sort={(left, right) => +this.selected.has(right.value) - +this.selected.has(left.value)}
        />
      </div>
    );
  }
}

export const NamespaceSelectFilter = withInjectables<Dependencies, SelectProps>(
  NonInjectedNamespaceSelectFilter,

  {
    getProps: (di, props) => ({
      model: di.inject(namespaceSelectFilterModelInjectable),
      namespaceStore: di.inject(namespaceStoreInjectable),
      ...props,
    }),
  },
);

type CustomPlaceholderProps = PlaceholderProps<any, boolean>;

interface PlaceholderDependencies {
  namespaceStore: NamespaceStore
}

const NonInjectedPlaceholder = observer(
  ({ namespaceStore, ...props }: CustomPlaceholderProps & PlaceholderDependencies) => {
    const getPlaceholder = (): React.ReactNode => {
      const namespaces = namespaceStore.contextNamespaces;

      if (namespaceStore.areAllSelectedImplicitly || !namespaces.length) {
        return <>All namespaces</>;
      }

      if (namespaces.length === 1) {
        return <>Namespace: {namespaces[0]}</>;
      }

      return <>Namespaces: {namespaces.join(", ")}</>;
    };

    return (
      <components.Placeholder {...props}>
        {getPlaceholder()}
      </components.Placeholder>
    );
  },
);


const Placeholder = withInjectables<PlaceholderDependencies, CustomPlaceholderProps>(
  NonInjectedPlaceholder,

  {
    getProps: (di, props) => ({
      namespaceStore: di.inject(namespaceStoreInjectable),
      ...props,
    }),
  },
);

