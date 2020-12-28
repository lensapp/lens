import "./namespace-select.scss";

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { namespaceStore } from "./namespace.store";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show cluster option on the top (default: false)
  clusterOptionLabel?: React.ReactNode; // label for cluster option (default: "Cluster")
  customizeOptions?(nsOptions: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
  get clusterOptionLabel() {
    return `Cluster`;
  },
};

@observer
export class NamespaceSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (!namespaceStore.isLoaded) {
      await namespaceStore.loadAll();
    }
    this.unsubscribe = namespaceStore.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  @computed get options(): SelectOption[] {
    const { customizeOptions, showClusterOption, clusterOptionLabel } = this.props;
    let options: SelectOption[] = namespaceStore.items.map(ns => ({ value: ns.getName() }));

    options = customizeOptions ? customizeOptions(options) : options;

    if (showClusterOption) {
      options.unshift({ value: null, label: clusterOptionLabel });
    }

    return options;
  }

  formatOptionLabel = (option: SelectOption) => {
    const { showIcons } = this.props;
    const { value, label } = option;

    return label || (
      <>
        {showIcons && <Icon small material="layers" />}
        {value}
      </>
    );
  };

  render() {
    const { className, showIcons, showClusterOption, clusterOptionLabel, customizeOptions, ...selectProps } = this.props;

    return (
      <Select
        className={cssNames("NamespaceSelect", className)}
        menuClass="NamespaceSelectMenu"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        {...selectProps}
      />
    );
  }
}

@observer
export class NamespaceSelectFilter extends React.Component {
  render() {
    const { contextNs, hasContext, toggleContext } = namespaceStore;
    let placeholder = <>All namespaces</>;

    if (contextNs.length == 1) placeholder = <>Namespace: {contextNs[0]}</>;
    if (contextNs.length >= 2) placeholder = <>Namespaces: {contextNs.join(", ")}</>;

    return (
      <NamespaceSelect
        placeholder={placeholder}
        closeMenuOnSelect={false}
        isOptionSelected={() => false}
        controlShouldRenderValue={false}
        isMulti
        onChange={([{ value }]: SelectOption[]) => toggleContext(value)}
        formatOptionLabel={({ value: namespace }: SelectOption) => {
          const isSelected = hasContext(namespace);

          return (
            <div className="flex gaps align-center">
              <FilterIcon type={FilterType.NAMESPACE} />
              <span>{namespace}</span>
              {isSelected && <Icon small material="check" className="box right" />}
            </div>
          );
        }}
      />
    );
  }
}
