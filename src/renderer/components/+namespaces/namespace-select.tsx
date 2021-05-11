import "./namespace-select.scss";

import Color from "color";
import { computed, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { findDOMNode } from "react-dom";
import { components, SelectComponentsConfig, ValueContainerProps } from "react-select";

import { kubeWatchApi } from "../../api/kube-watch-api";
import { ThemeStore } from "../../theme.store";
import { cssNames } from "../../utils";
import { computeStackingColor } from "../../utils/color";
import { Icon } from "../icon";
import { Select, SelectOption, SelectProps } from "../select";
import { namespaceStore } from "./namespace.store";

interface Props extends SelectProps {
  showIcons?: boolean;
  showClusterOption?: boolean; // show "Cluster" option on the top (default: false)
  showAllNamespacesOption?: boolean; // show "All namespaces" option on the top (default: false)
  customizeOptions?(options: SelectOption[]): SelectOption[];
}

const defaultProps: Partial<Props> = {
  showIcons: true,
  components: {},
  customizeOptions: (options) => options,
};

function getGVCStyle(position: "front" | "back", backgroundColor: Color): React.CSSProperties {
  const placement = position === "front" ? "left" : "right";
  const direction = position === "front" ? "to right" : "to left";

  return {
    [placement]: "0px",
    background: `linear-gradient(${direction}, ${backgroundColor.rgb().toString()} 0px, transparent)`,
  };
}

function getGVC<T>(trueBackgroundColour: Color): React.FunctionComponent {
  return function ({children, ...rest}: ValueContainerProps<T>) {
    return (
      <components.ValueContainer {...rest}>
        <div className="GradientValueContainer" style={getGVCStyle("front", trueBackgroundColour)} />
        {children}
        <div className="GradientValueContainer" style={getGVCStyle("back", trueBackgroundColour)} />
      </components.ValueContainer>
    );
  };
}

@observer
export class NamespaceSelect extends React.Component<Props> {
  static defaultProps = defaultProps as object;
  @observable ValueContainer?: React.ComponentClass<ValueContainerProps<any>> | React.FunctionComponent;

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    const elem = findDOMNode(this) as HTMLElement;

    this.ValueContainer = getGVC(computeStackingColor(elem, "backgroundColor"));

    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([namespaceStore], {
        preload: true,
        loadOnce: true, // skip reloading namespaces on every render / page visit
      }),
      ThemeStore.getInstance().onThemeApplied(() => {
        this.ValueContainer = getGVC(computeStackingColor(elem, "backgroundColor"));
      }),
    ]);
  }

  @computed get components(): SelectComponentsConfig<SelectOption> {
    if (!this.ValueContainer) {
      return this.props.components;
    }

    const { components: { ValueContainer, ...components } } = this.props;

    return {
      ...components,
      ValueContainer: this.ValueContainer,
    };
  }

  @computed.struct get options(): SelectOption[] {
    const { customizeOptions, showClusterOption, showAllNamespacesOption } = this.props;
    const options: SelectOption[] = namespaceStore.items.map(ns => ({ value: ns.getName() }));

    if (showAllNamespacesOption) {
      options.unshift({ label: "All Namespaces", value: "" });
    } else if (showClusterOption) {
      options.unshift({ label: "Cluster", value: "" });
    }

    return customizeOptions(options);
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
    const { className, showIcons, customizeOptions, components, ...selectProps } = this.props;

    return (
      <Select
        className={cssNames("NamespaceSelect", className)}
        menuClass="NamespaceSelectMenu"
        formatOptionLabel={this.formatOptionLabel}
        options={this.options}
        components={this.components}
        {...selectProps}
      />
    );
  }
}
