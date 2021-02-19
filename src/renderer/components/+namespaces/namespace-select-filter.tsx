import "./namespace-select.scss";

import React from "react";
import { observer } from "mobx-react";
import { components, PlaceholderProps } from "react-select";

import { Icon } from "../icon";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";
import { SelectOption } from "../select";
import { NamespaceSelect } from "./namespace-select";
import { namespaceStore } from "./namespace.store";

const Placeholder = observer((props: PlaceholderProps<any>) => {
  const getPlaceholder = (): React.ReactNode => {
    const namespaces = namespaceStore.selectedNamespaces;

    if (namespaceStore.selectedAll) {
      return <>All namespaces</>;
    }

    switch (namespaces.length) {
      case 0:
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
