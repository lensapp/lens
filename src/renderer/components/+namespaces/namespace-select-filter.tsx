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
import type { NamespaceStore } from "./namespace-store/namespace.store";

import type { SelectOption, SelectProps } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { NamespaceSelectFilterModel } from "./namespace-select-filter-model/namespace-select-filter-model";
import namespaceSelectFilterModelInjectable from "./namespace-select-filter-model/namespace-select-filter-model.injectable";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";

interface Dependencies {
  model: NamespaceSelectFilterModel;
}

class NonInjectedNamespaceSelectFilter extends React.Component<
  SelectProps & Dependencies
> {
  render() {
    return (
      <div
        onKeyUp={this.props.model.onKeyUp}
        onKeyDown={this.props.model.onKeyDown}
        onClick={this.props.model.onClick}
      >
        <NamespaceSelect
          isMulti={true}
          menuIsOpen={this.props.model.menuIsOpen}
          components={{ Placeholder }}
          showAllNamespacesOption={true}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          placeholder={""}
          onChange={this.props.model.onChange}
          onBlur={this.props.model.reset}
          formatOptionLabel={formatOptionLabelFor(this.props.model)}
          className="NamespaceSelectFilter"
          menuClass="NamespaceSelectFilterMenu"
          sort={(left, right) =>
            +this.props.model.selectedNames.has(right.value) -
            +this.props.model.selectedNames.has(left.value)
          }
        />
      </div>
    );
  }
}

const formatOptionLabelFor =
  (model: NamespaceSelectFilterModel) =>
    ({ value: namespace, label }: SelectOption) => {
      if (namespace) {
        const isSelected = model.isSelected(namespace);

        return (
          <div className="flex gaps align-center">
            <Icon small material="layers" />
            <span>{namespace}</span>
            {isSelected && <Icon small material="check" className="box right" />}
          </div>
        );
      }

      return label;
    };

export const NamespaceSelectFilter = withInjectables<Dependencies, SelectProps>(
  observer(NonInjectedNamespaceSelectFilter),

  {
    getProps: (di, props) => ({
      model: di.inject(namespaceSelectFilterModelInjectable),
      ...props,
    }),
  },
);

type CustomPlaceholderProps = PlaceholderProps<any, boolean>;

interface PlaceholderDependencies {
  namespaceStore: NamespaceStore;
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
