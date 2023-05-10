/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React from "react";
import type { IComputedValue, ObservableSet } from "mobx";
import { action, computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ReactSelect, { components, createFilter } from "react-select";
import type { Props as ReactSelectProps, GroupBase, MultiValue, OptionsOrGroups, PropsValue, SingleValue } from "react-select";
import type { LensTheme } from "../../themes/lens-theme";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active.injectable";
import autoBindReact from "auto-bind/react";

const { Menu } = components;

export interface SelectOption<Value> {
  value: Value;
  label: StrictReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  id?: string;
}

/**
 * @deprecated This should not be used anymore, convert the options yourself.
 */
export type LegacyAutoConvertedOptions = string[];

export interface SelectProps<
  Value,
  /**
   * This needs to extend `object` because even though `ReactSelectProps` allows for any `T`, the
   * maintainers of `react-select` says that they don't support it.
   *
   * Ref: https://github.com/JedWatson/react-select/issues/5032
   *
   * Futhermore, we mandate the option is of this shape because it is easier than requiring
   * `getOptionValue` and `getOptionLabel` all over the place.
   */
  Option extends SelectOption<Value>,
  IsMulti extends boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends Omit<ReactSelectProps<Option, IsMulti, Group>, "value" | "options"> {
  id?: string; // Optional only because of Extension API. Required to make Select deterministic in unit tests
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
  value?: PropsValue<Value>;
  options: NonNullable<ReactSelectProps<Option, IsMulti, Group>["options"]> | LegacyAutoConvertedOptions;

  /**
   * @deprecated This option does nothing
   */
  isCreatable?: boolean;

  /**
   * @deprecated We will always auto convert options if they are of type `string`
   */
  autoConvertOptions?: boolean;
}

function isGroup<Option, Group extends GroupBase<Option>>(optionOrGroup: Option | Group): optionOrGroup is Group {
  return Array.isArray((optionOrGroup as Group).options);
}

const defaultFilter = createFilter({
  stringify(option) {
    if (typeof option.value === "symbol") {
      return option.label;
    }

    return `${option.label} ${option.value}`;
  },
});

interface Dependencies {
  activeTheme: IComputedValue<LensTheme>;
}

export function onMultiSelectFor<Value, Option extends SelectOption<Value>, Group extends GroupBase<Option> = GroupBase<Option>>(collection: Set<Value> | ObservableSet<Value>): SelectProps<Value, Option, true, Group>["onChange"] {
  return action((newValue, meta) => {
    switch (meta.action) {
      case "clear":
        collection.clear();
        break;
      case "deselect-option":
      case "remove-value":
      case "pop-value":
        if (meta.option) {
          collection.delete(meta.option.value);
        }
        break;
      case "select-option":
        if (meta.option) {
          collection.add(meta.option.value);
        }
        break;
    }
  });
}

@observer
class NonInjectedSelect<
  Value,
  Option extends SelectOption<Value>,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends React.Component<SelectProps<Value, Option, IsMulti, Group> & Dependencies> {
  static defaultProps = {
    menuPortalTarget: document.body,
    menuPlacement: "auto" as const,
  };

  constructor(props: SelectProps<Value, Option, IsMulti, Group> & Dependencies) {
    super(props);
    makeObservable(this);
    autoBindReact(this);
  }

  @computed get themeClass() {
    const themeName = this.props.themeName || this.props.activeTheme.get().type;

    return `theme-${themeName}`;
  }

  onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {
    this.props.onKeyDown?.(evt);

    if (evt.nativeEvent.code === "Escape") {
      evt.stopPropagation(); // don't close the <Dialog/>
    }
  }

  private filterSelectedMultiValue(values: MultiValue<Value> | null, options: OptionsOrGroups<Option, Group>): MultiValue<Option> | null {
    if (!values) {
      return null;
    }

    return options
      .flatMap(option => (
        isGroup(option)
          ? option.options
          : option
      ))
      .filter(option => values.includes(option.value));
  }

  private findSelectedSingleValue(value: SingleValue<Value>, options: OptionsOrGroups<Option, Group>): SingleValue<Option> {
    if (value === null) {
      return null;
    }

    for (const optionOrGroup of options) {
      if (isGroup(optionOrGroup)) {
        for (const option of optionOrGroup.options) {
          if (option.value === value) {
            return option;
          }
        }
      } else if (optionOrGroup.value === value) {
        return optionOrGroup;
      }
    }

    return null;
  }

  private findSelectedPropsValue(value: PropsValue<Value>, options: OptionsOrGroups<Option, Group>, isMulti: IsMulti | undefined): PropsValue<Option> {
    if (isMulti) {
      return this.filterSelectedMultiValue(value as MultiValue<Value>, options);
    }

    return this.findSelectedSingleValue(value as SingleValue<Value>, options);
  }

  render() {
    const {
      className,
      menuClass,
      components: {
        Menu: WrappedMenu = Menu,
        ...components
      } = {},
      styles,
      value = null,
      options,
      isMulti,
      id: inputId,
      onChange,
      ...props
    } = this.props;

    const convertedOptions = options.map(option => (
      typeof option === "string"
        ? {
          value: option,
          label: option,
        } as unknown as Option
        : option
    ));

    if (options.length > 0 && !(options?.[0] as { label?: string }).label) {
      console.warn("[SELECT]: will not display any label in dropdown");
    }

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
        instanceId={inputId}
        inputId={inputId}
        filterOption={defaultFilter} // This is done because the default filter crashes on symbols
        isMulti={isMulti}
        options={convertedOptions}
        value={this.findSelectedPropsValue(value, convertedOptions, isMulti)}
        onKeyDown={this.onKeyDown}
        className={cssNames("Select", this.themeClass, className)}
        classNamePrefix="Select"
        onChange={action(onChange)} // This is done so that all changes are actionable
        components={{
          ...components,
          Menu: ({ className, ...props }) => (
            <WrappedMenu
              {...props}
              className={cssNames(menuClass, this.themeClass, className, {
                [`${inputId}-options`]: !!inputId,
              })}
            />
          ),
        }}
      />
    );
  }
}

export const Select = withInjectables<Dependencies, SelectProps<unknown, SelectOption<unknown>, boolean>>(NonInjectedSelect, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
  }),
}) as <
  Value,
  Option extends SelectOption<Value>,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: SelectProps<Value, Option, IsMulti, Group>) => React.ReactElement;
