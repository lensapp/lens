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

import "./namespace-select.scss";

import React from "react";
import { observer } from "mobx-react";
import { components, PlaceholderProps } from "react-select";

import { Icon } from "../icon";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";
import type { SelectOption } from "../select";
import { NamespaceSelect } from "./namespace-select";
import { namespaceStore } from "./namespace.store";

const Placeholder = observer((props: PlaceholderProps<any>) => {
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
export class NamespaceSelectFilter extends React.Component {
  formatOptionLabel({ value: namespace, label }: SelectOption) {
    if (namespace) {
      const isSelected = namespaceStore.hasContext(namespace);

      return (
        <div className="flex gaps align-center">
          <FilterIcon type={FilterType.NAMESPACE}/>
          <span>{namespace}</span>
          {isSelected && <Icon small material="check" className="box right"/>}
        </div>
      );
    }

    return label;
  }

  onChange([{ value: namespace }]: SelectOption[]) {
    if (namespace) {
      namespaceStore.toggleContext(namespace);
    } else {
      namespaceStore.toggleAll(false); // "All namespaces" clicked
    }
  }

  render() {
    return (
      <NamespaceSelect
        isMulti={true}
        components={{ Placeholder }}
        showAllNamespacesOption={true}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        placeholder={""}
        onChange={this.onChange}
        formatOptionLabel={this.formatOptionLabel}
      />
    );
  }
}
