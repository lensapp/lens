/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./input.scss";

import React, { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { boundMethod, cssNames, debouncePromise, getRandId } from "../../utils";
import { Icon } from "../icon";
import { Tooltip, TooltipProps } from "../tooltip";
import * as Validators from "./input_validators";
import type { InputValidator } from "./input_validators";
import isFunction from "lodash/isFunction";
import isBoolean from "lodash/isBoolean";
import uniqueId from "lodash/uniqueId";
import { debounce } from "lodash";

const { conditionalValidators, ...InputValidators } = Validators;

export { InputValidators };
export type { InputValidator };

/**
 * Either an {@link HTMLInputElement} or an {@link HTMLTextAreaElement}
 */
export type InputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * The builtin props for {@link InputElement}
 */
export type InputElementProps = InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement> & DOMAttributes<InputElement>;

/**
 * The information provided for rendering a custom icon
 */
export interface IconDataFnArg {
  /**
   * is `true` if the input is not the same as the original value
   */
  isDirty: boolean;
}

/**
 * One of the folloing:
 * - A material icon name
 * - A react node
 * - Or a function that produces a react node
 */
export type IconData = string | React.ReactNode | ((opt: IconDataFnArg) => React.ReactNode);

/**
 * The props for {@link Input}
 */
export type InputProps = Omit<InputElementProps, "onChange" | "onSubmit"> & {
  /**
   * Determins which style of input to use
   *
   * @default "line"
   */
  theme?: "round-black" | "round" | "line";

  /**
   * Any additional class names for this instance
   */
  className?: string;

  /**
   * The current value. Must always be defined, or never. If not provided then
   * this component will act as if it is not managed
   */
  value?: string;

  /**
   * Should the input be trimmed of leading and trailing whitespace before
   * being passed to the `onChange` or `onSubmit` handlers
   *
   * @default false
   */
  trim?: boolean;

  /**
   * Should the input be selected when the input becomes focused.
   *
   * @default false
   */
  autoSelectOnFocus?: boolean;

  /**
   * If specified and the component is not in managed mode then this will be
   * used when not valid has been typed
   */
  defaultValue?: string;

  /**
   * If `true` then the input field will be a `<textarea>` instead of an `<input>`
   *
   * @default false
   */
  multiLine?: boolean;

  /**
   * Only relavent when {@link InputProps.multiLine} is `true`.
   *
   * Sets the maximum number of rows that the text area will grow to.
   *
   * @default 10_000
   */
  maxRows?: number;

  /**
   * If set then validation errors will be shown even if no input has been shown yet.
   *
   * @default false
   */
  dirty?: boolean;

  /**
   * If `true` then an animation will be shown while async validators are being run
   *
   * @default true
   */
  showValidationLine?: boolean;

  /**
   * If truthy then validation errors will be shown as a tooltip on hover,
   * instead of as a list of errors below the input.
   *
   * Can also be an object for controlling the tooltip.
   *
   * @default false
   */
  showErrorsAsTooltip?: boolean | Omit<TooltipProps, "targetId">;

  /**
   * Data for rendering an icon on the left side of the input field
   */
  iconLeft?: IconData;

  /**
   * Data for rendering an icon on the right side of the input field
   */
  iconRight?: IconData;

  /**
   * Content that should be shown to the right of {@link InputProps.iconRight}
   */
  contentRight?: React.ReactNode;

  /**
   * Either a single or a list of validators that should be run on the input
   * as it changes.
   *
   * @default []
   */
  validators?: InputValidator | InputValidator[];

  /**
   * If true then a `blur` event will be emitted on this component when the
   * ENTER key is pressed
   *
   * @default true
   */
  blurOnEnter?: boolean;

  /**
   * A function to be called on all changes
   * @param value The new value that was inputed, before any validation is done
   * @param evt The React change event
   */
  onChange?(value: string, evt: React.ChangeEvent<InputElement>): void;

  /**
   * A function to be called when "enter" is pressed and the input is validated
   * @param value The value, only after all validations have passed
   * @param evt The react keyboard event that triggered the submit
   */
  onSubmit?(value: string, evt: React.KeyboardEvent<InputElement>): void;
};
export interface InputState {
  focused: boolean;
  dirty: boolean;
  valid: boolean;
  validating: boolean;
  errors: React.ReactNode[];
  submitted: boolean;
}

const defaultProps: Partial<InputProps> = {
  rows: 1,
  maxRows: 10000,
  showValidationLine: true,
  validators: [],
  blurOnEnter: true,
  trim: false,
  autoSelectOnFocus: false,
  showErrorsAsTooltip: false,
  dirty: false,
};

/**
 * A component for getting user input
 */
export class Input extends React.Component<InputProps, InputState> {
  static defaultProps = defaultProps as object;

  public input: InputElement | null = null;
  public validators: InputValidator[] = [];

  public state: InputState = {
    focused: false,
    valid: true,
    validating: false,
    dirty: !!this.props.dirty,
    errors: [],
    submitted: false,
  };

  componentWillUnmount(): void {
    this.setDirtyOnChange.cancel();
  }

  setValue(value = "") {
    if (value !== this.getValue()) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(this.input.constructor.prototype, "value").set;

      nativeInputValueSetter.call(this.input, value);
      const evt = new Event("input", { bubbles: true });

      this.input.dispatchEvent(evt);
    }
  }

  getValue(): string {
    const { trim, value, defaultValue } = this.props;
    const rawValue = value ?? this.input?.value ?? defaultValue ?? "";

    return trim ? rawValue.trim() : rawValue;
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

  async validate() {
    const value = this.getValue();
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
            error => this.getValidatorError(value, validator) || error,
          ),
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

    this.input?.setCustomValidity(errors.length ? errors[0].toString() : "");
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
    this.setState({ dirty });
  }

  @boundMethod
  onFocus(evt: React.FocusEvent<InputElement>) {
    const { onFocus, autoSelectOnFocus } = this.props;

    onFocus?.(evt);
    if (autoSelectOnFocus) this.select();
    this.setState({ focused: true });
  }

  @boundMethod
  onBlur(evt: React.FocusEvent<InputElement>) {
    this.props.onBlur?.(evt);
    this.setState({ focused: false });
  }

  setDirtyOnChange = debounce(() => this.setDirty(), 500);

  @boundMethod
  onChange(evt: React.ChangeEvent<any>) {
    this.props.onChange?.(evt.currentTarget.value, evt);
    this.validate();
    this.autoFitHeight();
    this.setDirtyOnChange();

    // re-render component when used as uncontrolled input
    // when used @defaultValue instead of @value changing real input.value doesn't call render()
    if (this.isUncontrolled && this.showMaxLenIndicator) {
      this.forceUpdate();
    }
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<InputElement>) {
    this.props.onKeyDown?.(evt);

    if (evt.shiftKey || evt.metaKey || evt.altKey || evt.ctrlKey || evt.repeat) {
      return;
    }

    if (evt.key === "Enter") {
      if (this.state.valid) {
        this.props.onSubmit?.(this.getValue(), evt);
        this.setDirtyOnChange.cancel();
        this.setState({ submitted: true });

        if (this.input && typeof this.props.value !== "string") {
          this.input.value = "";
        }
      } else {
        this.setDirty();
      }

      if(this.props.blurOnEnter){
        //pressing enter indicates that the edit is complete, we can unfocus now
        this.blur();
      }
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
      if (!this.state.submitted) {
        this.validate();
      } else {
        this.setState({ submitted: false });
      }
      this.autoFitHeight();
    }

    if (prevProps.dirty !== dirty) {
      this.setDirty(dirty);
    }

    if (prevProps.validators !== validators) {
      this.setupValidators();
    }
  }

  get themeSelection(): Record<string, boolean> {
    const { theme } = this.props;

    if (!theme || theme === "line") {
      return {};
    }

    return {
      theme: true,
      round: true,
      black: theme === "round-black",
    };
  }

  @boundMethod
  bindRef(elem: InputElement) {
    this.input = elem;
  }

  private renderIcon(iconData: IconData) {
    if (typeof iconData === "string") {
      return <Icon material={iconData} />;
    }

    if (typeof iconData === "function") {
      return iconData({
        isDirty: Boolean(this.getValue()),
      });
    }

    return iconData;
  }

  render() {
    const {
      multiLine, showValidationLine, validators, theme, maxRows, children, showErrorsAsTooltip,
      maxLength, rows, disabled, autoSelectOnFocus, iconLeft, iconRight, contentRight, id,
      dirty: _dirty, // excluded from passing to input-element
      defaultValue,
      trim,
      blurOnEnter,
      ...inputProps
    } = this.props;
    const { focused, dirty, valid, validating, errors } = this.state;

    const className = cssNames("Input", this.props.className, {
      ...this.themeSelection,
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
          {this.renderIcon(iconLeft)}
          {multiLine ? <textarea {...inputProps as any} /> : <input {...inputProps as any} />}
          {this.renderIcon(iconRight)}
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
