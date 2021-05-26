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

import "./input.scss";

import React, { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { boundMethod, cssNames, debouncePromise, getRandId } from "../../utils";
import { Icon } from "../icon";
import { Tooltip, TooltipProps } from "../tooltip";
import * as Validators from "./input_validators";
import type { InputValidator } from "./input_validators";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";
import isBoolean from "lodash/isBoolean";
import uniqueId from "lodash/uniqueId";

const { conditionalValidators, ...InputValidators } = Validators;

export { InputValidators };
export type { InputValidator };

type InputElement = HTMLInputElement | HTMLTextAreaElement;
type InputElementProps = InputHTMLAttributes<InputElement> & TextareaHTMLAttributes<InputElement> & DOMAttributes<InputElement>;

export type InputProps<T = string> = Omit<InputElementProps, "onChange" | "onSubmit"> & {
  theme?: "round-black";
  className?: string;
  value?: T;
  autoSelectOnFocus?: boolean
  multiLine?: boolean; // use text-area as input field
  maxRows?: number; // when multiLine={true} define max rows size
  dirty?: boolean; // show validation errors even if the field wasn't touched yet
  showValidationLine?: boolean; // show animated validation line for async validators
  showErrorsAsTooltip?: boolean | Omit<TooltipProps, "targetId">; // show validation errors as a tooltip :hover (instead of block below)
  iconLeft?: string | React.ReactNode; // material-icon name in case of string-type
  iconRight?: string | React.ReactNode;
  contentRight?: string | React.ReactNode; // Any component of string goes after iconRight
  validators?: InputValidator | InputValidator[];
  onChange?(value: T, evt: React.ChangeEvent<InputElement>): void;
  onSubmit?(value: T): void;
};

interface State {
  focused?: boolean;
  dirty?: boolean;
  dirtyOnBlur?: boolean;
  valid?: boolean;
  validating?: boolean;
  errors?: React.ReactNode[];
}

const defaultProps: Partial<InputProps> = {
  rows: 1,
  maxRows: 10000,
  showValidationLine: true,
  validators: [],
};

export class Input extends React.Component<InputProps, State> {
  static defaultProps = defaultProps as object;

  public input: InputElement;
  public validators: InputValidator[] = [];

  public state: State = {
    dirty: !!this.props.dirty,
    valid: true,
    errors: [],
  };

  isValid() {
    return this.state.valid;
  }

  setValue(value: string) {
    if (value !== this.getValue()) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(this.input.constructor.prototype, "value").set;

      nativeInputValueSetter.call(this.input, value);
      const evt = new Event("input", { bubbles: true });

      this.input.dispatchEvent(evt);
    }
  }

  getValue(): string {
    const { value, defaultValue = "" } = this.props;

    if (value !== undefined) return value; // controlled input
    if (this.input) return this.input.value; // uncontrolled input

    return defaultValue as string;
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  private autoFitHeight() {
    const { multiLine, rows, maxRows } = this.props;

    if (!multiLine) {
      return;
    }
    const textArea = this.input;
    const lineHeight = parseFloat(window.getComputedStyle(textArea).lineHeight);
    const rowsCount = (this.getValue().match(/\n/g) || []).length + 1;
    const height = lineHeight * Math.min(Math.max(rowsCount, rows), maxRows);

    textArea.style.height = `${height}px`;
  }

  private validationId: string;

  async validate(value = this.getValue()) {
    let validationId = (this.validationId = ""); // reset every time for async validators
    const asyncValidators: Promise<any>[] = [];
    const errors: React.ReactNode[] = [];

    // run validators
    for (const validator of this.validators) {
      if (errors.length) {
        // stop validation check if there is an error already
        break;
      }
      const result = validator.validate(value, this.props);

      if (isBoolean(result) && !result) {
        errors.push(this.getValidatorError(value, validator));
      } else if (result instanceof Promise) {
        if (!validationId) {
          this.validationId = validationId = uniqueId("validation_id_");
        }
        asyncValidators.push(
          result.then(
            () => null, // don't consider any valid result from promise since we interested in errors only
            error => this.getValidatorError(value, validator) || error
          )
        );
      }
    }

    // save sync validators result first
    this.setValidation(errors);

    // handle async validators result
    if (asyncValidators.length > 0) {
      this.setState({ validating: true, valid: false });
      const asyncErrors = await Promise.all(asyncValidators);

      if (this.validationId === validationId) {
        this.setValidation(errors.concat(...asyncErrors.filter(err => err)));
      }
    }

    this.input.setCustomValidity(errors.length ? errors[0].toString() : "");
  }

  setValidation(errors: React.ReactNode[]) {
    this.setState({
      validating: false,
      valid: !errors.length,
      errors,
    });
  }

  private getValidatorError(value: string, { message }: InputValidator) {
    if (isFunction(message)) return message(value, this.props);

    return message || "";
  }

  private setupValidators() {
    this.validators = conditionalValidators
      // add conditional validators if matches input props
      .filter(validator => validator.condition(this.props))
      // add custom validators
      .concat(this.props.validators)
      // debounce async validators
      .map(({ debounce, ...validator }) => {
        if (debounce) validator.validate = debouncePromise(validator.validate, debounce);

        return validator;
      });
    // run validation
    this.validate();
  }

  setDirty(dirty = true) {
    if (this.state.dirty === dirty) return;
    this.setState({ dirty });
  }

  @boundMethod
  onFocus(evt: React.FocusEvent<InputElement>) {
    const { onFocus, autoSelectOnFocus } = this.props;

    if (onFocus) onFocus(evt);
    if (autoSelectOnFocus) this.select();
    this.setState({ focused: true });
  }

  @boundMethod
  onBlur(evt: React.FocusEvent<InputElement>) {
    const { onBlur } = this.props;

    if (onBlur) onBlur(evt);
    if (this.state.dirtyOnBlur) this.setState({ dirty: true, dirtyOnBlur: false });
    this.setState({ focused: false });
  }

  @boundMethod
  onChange(evt: React.ChangeEvent<any>) {
    if (this.props.onChange) {
      this.props.onChange(evt.currentTarget.value, evt);
    }

    this.validate();
    this.autoFitHeight();

    // mark input as dirty for the first time only onBlur() to avoid immediate error-state show when start typing
    if (!this.state.dirty) this.setState({ dirtyOnBlur: true });

    // re-render component when used as uncontrolled input
    // when used @defaultValue instead of @value changing real input.value doesn't call render()
    if (this.isUncontrolled && this.showMaxLenIndicator) {
      this.forceUpdate();
    }
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<any>) {
    const modified = evt.shiftKey || evt.metaKey || evt.altKey || evt.ctrlKey;

    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }

    switch (evt.key) {
      case "Enter":
        if (this.props.onSubmit && !modified && !evt.repeat && this.isValid) {
          this.props.onSubmit(this.getValue());
        }
        break;
    }
  }

  get showMaxLenIndicator() {
    const { maxLength, multiLine } = this.props;

    return maxLength && multiLine;
  }

  get isUncontrolled() {
    return this.props.value === undefined;
  }

  componentDidMount() {
    this.setupValidators();
    this.autoFitHeight();
  }

  componentDidUpdate(prevProps: InputProps) {
    const { defaultValue, value, dirty, validators } = this.props;

    if (prevProps.value !== value || defaultValue !== prevProps.defaultValue) {
      this.validate();
      this.autoFitHeight();
    }

    if (prevProps.dirty !== dirty) {
      this.setDirty(dirty);
    }

    if (prevProps.validators !== validators) {
      this.setupValidators();
    }
  }

  @boundMethod
  bindRef(elem: InputElement) {
    this.input = elem;
  }

  render() {
    const {
      multiLine, showValidationLine, validators, theme, maxRows, children, showErrorsAsTooltip,
      maxLength, rows, disabled, autoSelectOnFocus, iconLeft, iconRight, contentRight, id,
      dirty: _dirty, // excluded from passing to input-element
      ...inputProps
    } = this.props;
    const { focused, dirty, valid, validating, errors } = this.state;

    const className = cssNames("Input", this.props.className, {
      [`theme ${theme}`]: theme,
      focused,
      disabled,
      invalid: !valid,
      dirty,
      validating,
      validatingLine: validating && showValidationLine,
    });

    // prepare input props
    Object.assign(inputProps, {
      className: "input box grow",
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      rows: multiLine ? (rows || 1) : null,
      ref: this.bindRef,
      spellCheck: "false",
      disabled,
    });
    const showErrors = errors.length > 0 && !valid && dirty;
    const errorsInfo = (
      <div className="errors box grow">
        {errors.map((error, i) => <p key={i}>{error}</p>)}
      </div>
    );
    const componentId = id || showErrorsAsTooltip ? getRandId({ prefix: "input_tooltip_id" }) : undefined;
    let tooltipError: React.ReactNode;

    if (showErrorsAsTooltip && showErrors) {
      const tooltipProps = typeof showErrorsAsTooltip === "object" ? showErrorsAsTooltip : {};

      tooltipProps.className = cssNames("InputTooltipError", tooltipProps.className);
      tooltipError = (
        <Tooltip targetId={componentId} {...tooltipProps}>
          <div className="flex gaps align-center">
            <Icon material="error_outline"/>
            {errorsInfo}
          </div>
        </Tooltip>
      );
    }

    return (
      <div id={componentId} className={className}>
        {tooltipError}
        <label className="input-area flex gaps align-center" id="">
          {isString(iconLeft) ? <Icon material={iconLeft}/> : iconLeft}
          {multiLine ? <textarea {...inputProps as any} /> : <input {...inputProps as any} />}
          {isString(iconRight) ? <Icon material={iconRight}/> : iconRight}
          {contentRight}
        </label>
        <div className="input-info flex gaps">
          {!showErrorsAsTooltip && showErrors && errorsInfo}
          {this.showMaxLenIndicator && (
            <div className="maxLengthIndicator box right">
              {this.getValue().length} / {maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
}
