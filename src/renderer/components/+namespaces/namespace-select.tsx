import "./namespace-select.scss";

import React from "react";
import { computed } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Select, SelectOption, SelectProps } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { namespaceStore } from "./namespace.store";
import { kubeWatchApi } from "../../api/kube-watch-api";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show "Cluster" option on the top (default: false)
  showAllNamespacesOption?: boolean; // show "All namespaces" option on the top (default: false)
  customizeOptions?(options: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  showClusterOption: false,
};

@observer
export class NamespaceSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([namespaceStore], {
        preload: true,
      })
    ]);
  }

  @computed.struct get options(): SelectOption[] {
    const { customizeOptions, showClusterOption, showAllNamespacesOption } = this.props;
    let options: SelectOption[] = namespaceStore.items.map(ns => ({ value: ns.getName() }));

    if (showAllNamespacesOption) {
      options.unshift({ label: "All Namespaces", value: "" });
    } else if (showClusterOption) {
      options.unshift({ label: "Cluster", value: "" });
    }

    if (customizeOptions) {
      options = customizeOptions(options);
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
  };

  render() {
    const { className, showIcons, customizeOptions, ...selectProps } = this.props;

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
