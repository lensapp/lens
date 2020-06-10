import "./namespace-select.scss"

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { namespaceStore } from "./namespace.store";
import { _i18n } from "../../i18n";
import { FilterIcon } from "../item-object-list/filter-icon";
import { FilterType } from "../item-object-list/page-filters.store";
import { isAllowedResource } from "../../api/rbac"

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
    return _i18n._(t`Cluster`);
  },
};

@observer
export class NamespaceSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  private unsubscribe = noop;

  async componentDidMount() {
    if (isAllowedResource("namespaces") && !namespaceStore.isLoaded) {
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
        {showIcons && <Icon small material="layers"/>}
        {value}
      </>
    );
  }

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
    let placeholder = <Trans>All namespaces</Trans>;
    if (contextNs.length == 1) placeholder = <Trans>Namespace: {contextNs[0]}</Trans>
    if (contextNs.length >= 2) placeholder = <Trans>Namespaces: {contextNs.join(", ")}</Trans>
    return (
      <NamespaceSelect
        placeholder={placeholder}
        closeMenuOnSelect={false}
        isOptionSelected={() => false}
        controlShouldRenderValue={false}
        onChange={({ value: namespace }: SelectOption) => toggleContext(namespace)}
        formatOptionLabel={({ value: namespace }: SelectOption) => {
          const isSelected = hasContext(namespace);
          return (
            <div className="flex gaps align-center">
              <FilterIcon type={FilterType.NAMESPACE}/>
              <span>{namespace}</span>
              {isSelected && <Icon small material="check" className="box right"/>}
            </div>
          )
        }}
      />
    )
  }
}
