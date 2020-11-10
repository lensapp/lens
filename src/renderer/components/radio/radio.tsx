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
            name: name,
            disabled: disabled !== undefined ? disabled : radio.props.disabled,
            checked: radio.props.value === value,
            onChange: onChange
          } as any)
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
}

export class Radio extends React.Component<RadioProps> {
  private elem: HTMLElement;

  onChange = () => {
    const { value, onChange, checked } = this.props;
    if (!checked && onChange) {
      onChange(value);
    }
  }

  onKeyDown = (e: React.KeyboardEvent<any>) => {
    const SPACE_KEY = e.keyCode === 32;
    const ENTER_KEY = e.keyCode === 13;
    if (SPACE_KEY || ENTER_KEY) {
      this.elem.click();
      e.preventDefault();
    }
  }

  render() {
    const { className, label, checked, children, ...inputProps } = this.props;
    const componentClass = cssNames('Radio flex align-center', className, {
      checked: checked,
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
