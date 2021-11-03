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

import "./radio.scss";
import React from "react";
import { cssNames } from "../../utils";
import uniqueId from "lodash/uniqueId";

// todo: refactor with contexts

export interface RadioGroupProps {
  className?: any;
  value?: any;
  asButtons?: boolean;
  disabled?: boolean;
  onChange?(value: string): void;
}

export class RadioGroup extends React.Component<RadioGroupProps, {}> {
  render() {
    const name = uniqueId("radioGroup");
    const { value, asButtons, disabled, onChange } = this.props;
    let { className } = this.props;

    className = cssNames("RadioGroup", { buttonsView: asButtons }, className);
    const radios = React.Children.toArray(this.props.children) as React.ReactElement<RadioProps>[];

    return (
      <div className={className}>
        {radios.map(radio => {
          return React.cloneElement(radio, {
            name,
            disabled: disabled !== undefined ? disabled : radio.props.disabled,
            checked: radio.props.value === value,
            onChange,
          } as any);
        })}
      </div>
    );
  }
}

export type RadioProps = React.HTMLProps<any> & {
  name?: string;
  label?: React.ReactNode | any;
  value?: any;
  checked?: boolean;
  disabled?: boolean;
  onChange?(value: React.ChangeEvent<HTMLInputElement>): void;
};

export class Radio extends React.Component<RadioProps> {
  private elem: HTMLElement;

  onChange = () => {
    const { value, onChange, checked } = this.props;

    if (!checked && onChange) {
      onChange(value);
    }
  };

  onKeyDown = (e: React.KeyboardEvent<any>) => {
    const SPACE_KEY = e.keyCode === 32;
    const ENTER_KEY = e.keyCode === 13;

    if (SPACE_KEY || ENTER_KEY) {
      this.elem.click();
      e.preventDefault();
    }
  };

  render() {
    const { className, label, checked, children, ...inputProps } = this.props;
    const componentClass = cssNames("Radio flex align-center", className, {
      checked,
      disabled: this.props.disabled,
    });

    return (
      <label
        className={componentClass}
        tabIndex={!checked ? 0 : null}
        onKeyDown={this.onKeyDown}
        ref={e => this.elem = e}
      >
        <input {...inputProps} type="radio" checked={checked} onChange={this.onChange}/>
        <i className="tick flex center"/>
        {label ? <div className="label">{label}</div> : null}
        {children}
      </label>
    );
  }
}
