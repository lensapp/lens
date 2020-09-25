import "./namespace-select.scss"

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption, SelectProps } from "../select";
import { autobind, cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { namespaceStore } from "./namespace.store";
import { _i18n } from "../../i18n";
import ReactSelect, { ActionMeta, components } from "react-select";

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

interface BasicNS {
  label: React.ReactElement;
  value: string;
}

@observer
export class NamespaceSelectFilter extends React.Component {
  async componentDidMount() {
    if (!namespaceStore.isLoaded) {
      await namespaceStore.loadAll();
      namespaceStore.contextNs.clear();
    }
  }

  @autobind()
  onChange(value: BasicNS, actionMeta: ActionMeta<BasicNS>) {
    switch (actionMeta.action) {
    case "select-option":
      namespaceStore.contextNs.add(actionMeta.option.value)
      break
    case "clear":
      namespaceStore.contextNs.clear()
      break
    case "deselect-option":
      namespaceStore.contextNs.delete(actionMeta.option.value)
      break
    }
  }

  render() {
    return (
      <ReactSelect
        placeholder={<Trans>Filter by namespace...</Trans>}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        className={cssNames("Select", "NamespaceSelect", "theme-dark")}
        classNamePrefix="Select"
        components={{
          Menu(props) {
            return <components.Menu {...props} className="NamespaceSelectMenu" />
          }
        }}
        onChange={this.onChange}
        options={namespaceStore.Options}
        value={namespaceStore.SelectedValues}
        controlShouldRenderValue={false}
      />
    )
  }
}
