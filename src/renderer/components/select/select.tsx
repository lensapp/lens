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

const { Menu } = components;

/**
 * @deprecated This type is no longer used
 */
export interface SelectOption<T> {
  value: T;
  label?: React.ReactElement | string;
}

export interface SelectProps<
  /**
   * This needs to extend `object` because even though `ReactSelectProps` allows for any `T`, the
   * maintainers of `react-select` says that they don't support it.
   *
   * Ref: https://github.com/JedWatson/react-select/issues/5032
   */
  Option extends object,
  IsMulti extends boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends ReactSelectProps<Option, IsMulti, Group> {
  id?: string; // Optional only because of Extension API. Required to make Select deterministic in unit tests
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
}

@observer
export class Select<
  Option extends object,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends React.Component<SelectProps<Option, IsMulti, Group>> {
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
      value = null,
      ...props
    } = this.props;
    const WrappedMenu = components.Menu ?? Menu;

    return (
      <ReactSelect
        {...props}
        styles={{
          menuPortal: styles => ({
            ...styles,
            zIndex: "auto",
          }),
          ...styles,
        }}
        value={value}
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
