// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React, { ReactNode } from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { autobind, cssNames } from "../../utils";
import ReactSelect, { components } from "react-select";
import Creatable from "react-select/creatable";
import { themeStore } from "../../theme.store";

import type { ActionMeta, GroupTypeBase, OptionTypeBase, Props as ReactSelectProps, Styles as ReactSelectStyles } from "react-select";

const { Menu } = components;

type OptionType = { label: string; value: string };
type GroupType = GroupTypeBase<OptionType>;

export interface GroupSelectOption<T extends SelectOption = SelectOption> {
  label: ReactNode;
  options: T[];
}

export interface SelectOption<T = any> {
  value?: T;
  label?: React.ReactNode;
}

export interface SelectProps<T = any> extends ReactSelectProps<OptionTypeBase, boolean> {
  options?: ReadonlyArray<OptionType | GroupType | unknown>;
  value?: T;
  themeName?: "dark" | "light" | "outlined";
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

  @computed get theme() {
    return this.props.themeName || themeStore.activeTheme.type;
  }

  private styles: ReactSelectStyles<OptionTypeBase, boolean> = {
    menuPortal: styles => ({
      ...styles,
      zIndex: "auto"
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

  @computed get options(): readonly SelectOption[] {
    return this.props.options.map(opt => {
      return this.isValidOption(opt) ? opt : { value: opt, label: String(opt) };
    });
  }

  @autobind()
  onChange(value: SelectOption, meta: ActionMeta<any>) {
    if (this.props.onChange) {
      this.props.onChange(value, meta);
    }
  }

  @autobind()
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
    const themeClass = `theme-${this.theme}`;
    const WrappedMenu = components.Menu ?? Menu;

    const selectProps: Partial<SelectProps> = {
      ...props,
      styles: this.styles,
      value: autoConvertOptions ? this.selectedOption : value,
      options: autoConvertOptions ? this.options : options,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      className: cssNames("Select", themeClass, className),
      classNamePrefix: "Select",
      components: {
        ...components,
        Menu: props => (
          <WrappedMenu
            {...props}
            className={cssNames(menuClass, themeClass, props.className)}
          />
        ),
      }
    };

    return isCreatable
      ? <Creatable {...selectProps}/>
      : <ReactSelect {...selectProps}/>;
  }
}
