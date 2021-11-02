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

// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React, { ReactNode } from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ReactSelect, { ActionMeta, components, OptionTypeBase, Props as ReactSelectProps, Styles } from "react-select";
import Creatable, { CreatableProps } from "react-select/creatable";

import { ThemeStore } from "../../theme.store";
import { boundMethod, cssNames } from "../../utils";

const { Menu } = components;

export interface GroupSelectOption<T extends SelectOption = SelectOption> {
  label: ReactNode;
  options: T[];
}

export interface SelectOption<T = any> {
  value: T;
  label?: React.ReactNode;
}

export interface SelectProps<T = any> extends ReactSelectProps<T, boolean>, CreatableProps<T, boolean> {
  value?: T;
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
  isCreatable?: boolean;
  autoConvertOptions?: boolean; // to internal format (i.e. {value: T, label: string}[]), not working with groups
  onChange?(option: T, meta?: ActionMeta<any>): void;
}

@observer
export class Select extends React.Component<SelectProps> {
  static defaultProps: SelectProps = {
    autoConvertOptions: true,
    menuPortalTarget: document.body,
    menuPlacement: "auto",
  };

  constructor(props: SelectProps) {
    super(props);
    makeObservable(this);
  }

  @computed get themeClass() {
    const themeName = this.props.themeName || ThemeStore.getInstance().activeTheme.type;

    return `theme-${themeName}`;
  }

  private styles: Styles<OptionTypeBase, boolean> = {
    menuPortal: styles => ({
      ...styles,
      zIndex: "auto",
    }),
  };

  protected isValidOption(opt: SelectOption | any) {
    return typeof opt === "object" && opt.value !== undefined;
  }

  @computed get selectedOption() {
    const { value, isMulti } = this.props;

    if (isMulti) {
      return this.options.filter(opt => {
        const values = value ? [].concat(value) : [];

        return values.includes(opt) || values.includes(opt.value);
      });
    }

    return this.options.find(opt => opt === value || opt.value === value);
  }

  @computed get options(): SelectOption[] {
    const { autoConvertOptions, options } = this.props;

    if (autoConvertOptions && Array.isArray(options)) {
      return options.map(opt => {
        return this.isValidOption(opt) ? opt : { value: opt, label: String(opt) };
      });
    }

    return options as SelectOption[];
  }

  @boundMethod
  onChange(value: SelectOption, meta: ActionMeta<any>) {
    if (this.props.onChange) {
      this.props.onChange(value, meta);
    }
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }
    const escapeKey = evt.nativeEvent.code === "Escape";

    if (escapeKey) evt.stopPropagation(); // don't close the <Dialog/>
  }

  render() {
    const {
      className, menuClass, isCreatable, autoConvertOptions,
      value, options, components = {}, ...props
    } = this.props;
    const WrappedMenu = components.Menu ?? Menu;

    const selectProps: Partial<SelectProps> = {
      ...props,
      styles: this.styles,
      value: autoConvertOptions ? this.selectedOption : value,
      options: autoConvertOptions ? this.options : options,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      className: cssNames("Select", this.themeClass, className),
      classNamePrefix: "Select",
      components: {
        ...components,
        Menu: props => (
          <WrappedMenu
            {...props}
            className={cssNames(menuClass, this.themeClass, props.className)}
          />
        ),
      },
    };

    return isCreatable
      ? <Creatable {...selectProps}/>
      : <ReactSelect {...selectProps}/>;
  }
}
