/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./checkbox.scss";
import React from "react";
import { cssNames } from "../../utils";

export interface CheckboxProps<T = boolean> {
  className?: string;
  label?: React.ReactNode;
  inline?: boolean;
  disabled?: boolean;
  value?: T;
  onChange?(value: T, evt: React.ChangeEvent<HTMLInputElement>): void;
}

export class Checkbox extends React.PureComponent<CheckboxProps> {
  private input: HTMLInputElement;

  onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(this.input.checked, evt);
    }
  };

  getValue() {
    if (this.props.value !== undefined) return this.props.value;

    return this.input.checked;
  }

  render() {
    const { label, inline, className, value, children, ...inputProps } = this.props;
    const componentClass = cssNames("Checkbox flex align-center", className, {
      inline,
      checked: value,
      disabled: this.props.disabled,
    });

    return (
      <label className={componentClass}>
        <input
          {...inputProps}
          type="checkbox" checked={value} onChange={this.onChange}
          ref={e => this.input = e}
        />
        <i className="box flex align-center"/>
        {label ? <span className="label">{label}</span> : null}
        {children}
      </label>
    );
  }
}
