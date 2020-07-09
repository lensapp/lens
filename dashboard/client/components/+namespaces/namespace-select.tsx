import "./namespace-select.scss";

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

  async componentDidMount(): Promise<void> {
    if (!namespaceStore.isLoaded) {
      await namespaceStore.loadAll();
    }
    this.unsubscribe = namespaceStore.subscribe();
  }

  componentWillUnmount(): void {
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

  formatOptionLabel = (option: SelectOption): JSX.Element => {
    const { showIcons } = this.props;
    const { value, label } = option;
    if (label) {
      return (
        <>
          {showIcons && <Icon small material="layers" />}
          {value}
        </>
      );
    }
  }

  render(): JSX.Element {
    const { 
      className, 
      showIcons: _showIcons, 
      showClusterOption: _showClusterOption, 
      clusterOptionLabel: _clusterOptionLabel, 
      customizeOptions: _customizeOptions, 
      ...selectProps
    } = this.props;
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
  render(): JSX.Element {
    const { contextNs, hasContext, toggleContext } = namespaceStore;
    let placeholder = <Trans>All namespaces</Trans>;
    if (contextNs.length == 1) {
      placeholder = <Trans>Namespace: {contextNs[0]}</Trans>;
    }
    if (contextNs.length >= 2) {
      placeholder = <Trans>Namespaces: {contextNs.join(", ")}</Trans>;
    }
    return (
      <NamespaceSelect
        placeholder={placeholder}
        closeMenuOnSelect={false}
        isOptionSelected={(): boolean => false}
        controlShouldRenderValue={false}
        onChange={({ value: namespace }: SelectOption): void => toggleContext(namespace)}
        formatOptionLabel={({ value: namespace }: SelectOption): JSX.Element => {
          const isSelected = hasContext(namespace);
          return (
            <div className="flex gaps align-center">
              <FilterIcon type={FilterType.NAMESPACE}/>
              <span>{namespace}</span>
              {isSelected && <Icon small material="check" className="box right"/>}
            </div>
          );
        }}
      />
    );
  }
}
