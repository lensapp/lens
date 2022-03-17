/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ReactSelect, { components } from "react-select";
import type { Props as ReactSelectProps, GroupBase } from "react-select";
import { ThemeStore } from "../../theme.store";
import { autoBind, cssNames } from "../../utils";
import { merge } from "lodash";

const { Menu } = components;

/**
 * @deprecated This type is no longer used
 */
export interface SelectOption<T> {
  value: T;
  label?: React.ReactElement | string;
}

export interface SelectProps<Option, IsMulti extends boolean, Group extends GroupBase<Option> = GroupBase<Option>> extends ReactSelectProps<Option, IsMulti, Group> {
  id?: string; // Optional only because of Extension API. Required to make Select deterministic in unit tests
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
}

@observer
export class Select<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>> extends React.Component<SelectProps<Option, IsMulti, Group>> {
  static defaultProps = {
    menuPortalTarget: document.body,
    menuPlacement: "auto",
  };

  constructor(props: SelectProps<Option, IsMulti, Group>) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  @computed get themeClass() {
    const themeName = this.props.themeName || ThemeStore.getInstance().activeTheme.type;

    return `theme-${themeName}`;
  }

  onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {
    this.props.onKeyDown?.(evt);

    if (evt.nativeEvent.code === "Escape") {
      evt.stopPropagation(); // don't close the <Dialog/>
    }
  }

  render() {
    const {
      className,
      menuClass,
      components = {},
      styles,
      ...props
    } = this.props;
    const WrappedMenu = components.Menu ?? Menu;

    return (
      <ReactSelect
        {...props}
        styles={merge(styles, {
          menuPortal: styles => ({
            ...styles,
            zIndex: "auto",
          }),
        })}
        onKeyDown={this.onKeyDown}
        className={cssNames("Select", this.themeClass, className)}
        classNamePrefix="Select"
        components={{
          ...components,
          Menu: props => (
            <WrappedMenu
              {...props}
              className={cssNames(menuClass, this.themeClass, props.className)}
            />
          ),
        }}
      />
    );
  }
}
