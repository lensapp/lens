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

import "./checkbox.scss";
import React from "react";
import { boundMethod, cssNames } from "../../utils";

export interface CheckboxProps<T = boolean> {
  theme?: "dark" | "light";
  className?: string;
  label?: React.ReactNode;
  inline?: boolean;
  disabled?: boolean;
  value?: T;
  onChange?(value: T, evt: React.ChangeEvent<HTMLInputElement>): void;
}

export class Checkbox extends React.PureComponent<CheckboxProps> {
  private input: HTMLInputElement;

  @boundMethod
  onChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (this.props.onChange) {
      this.props.onChange(this.input.checked, evt);
    }
  }

  getValue() {
    if (this.props.value !== undefined) return this.props.value;

    return this.input.checked;
  }

  render() {
    const { label, inline, className, value, theme, children, ...inputProps } = this.props;
    const componentClass = cssNames("Checkbox flex align-center", className, {
      inline,
      checked: value,
      disabled: this.props.disabled,
      [`theme-${theme}`]: theme,
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
