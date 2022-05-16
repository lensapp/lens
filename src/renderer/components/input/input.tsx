/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./input.scss";

import type { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import React from "react";
import { autoBind, cssNames, debouncePromise, getRandId } from "../../utils";
import { Icon } from "../icon";
import type { TooltipProps } from "../tooltip";
import { Tooltip } from "../tooltip";
import * as Validators from "./input_validators";
import type { InputValidator } from "./input_validators";
import isFunction from "lodash/isFunction";
import isBoolean from "lodash/isBoolean";
import uniqueId from "lodash/uniqueId";
import { debounce } from "lodash";

const { conditionalValidators, ...InputValidators } = Validators;

export { InputValidators };
export type { InputValidator };

type InputElement = HTMLInputElement | HTMLTextAreaElement;
type InputElementProps = InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement> & DOMAttributes<InputElement>;

export interface IconDataFnArg {
  isDirty: boolean;
}

/**
 * One of the folloing:
 * - A material icon name
 * - A react node
 * - Or a function that produces a react node
 */
export type IconData = string | React.ReactNode | ((opt: IconDataFnArg) => React.ReactNode);

export type InputProps = Omit<InputElementProps, "onChange" | "onSubmit"> & {
  theme?: "round-black" | "round";
  className?: string;
  value?: string;
  trim?: boolean;
  autoSelectOnFocus?: boolean;
  defaultValue?: string;
  multiLine?: boolean; // use text-area as input field
  maxRows?: number; // when multiLine={true} define max rows size
  dirty?: boolean; // show validation errors even if the field wasn't touched yet
  showValidationLine?: boolean; // show animated validation line for async validators
  showErrorsAsTooltip?: boolean | Omit<TooltipProps, "targetId">; // show validation errors as a tooltip :hover (instead of block below)
  iconLeft?: IconData;
  iconRight?: IconData;
  contentRight?: string | React.ReactNode; // Any component of string goes after iconRight
  validators?: InputValidator<boolean> | InputValidator<boolean>[];
  blurOnEnter?: boolean;
  onChange?(value: string, evt: React.ChangeEvent<InputElement>): void;
  onSubmit?(value: string, evt: React.KeyboardEvent<InputElement>): void;
};

interface State {
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
};

function isAsyncValidator(validator: InputValidator<boolean>): validator is InputValidator<true> {
  return typeof validator.debounce === "number";
}

export class Input extends React.Component<InputProps, State> {
  static defaultProps = defaultProps as object;

  public input: InputElement | null = null;
  public validators: InputValidator<boolean>[] = [];

  public state: State = {
    focused: false,
    valid: true,
    validating: false,
    dirty: !!this.props.dirty,
    errors: [],
    submitted: false,
  };

  constructor(props: InputProps) {
    super(props);
    autoBind(this);
  }

  componentWillUnmount(): void {
    this.setDirtyOnChange.cancel();
  }

  setValue(value = "") {
    if (value !== this.getValue() && this.input) {
      Object.getOwnPropertyDescriptor(this.input.constructor.prototype, "value")
        ?.set
        ?.call(this.input, value);
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  getValue(): string {
    const { trim, value, defaultValue } = this.props;
    const rawValue = value ?? this.input?.value ?? defaultValue ?? "";

    return trim ? rawValue.trim() : rawValue;
  }

  focus() {
    this.input?.focus();
  }

  blur() {
    this.input?.blur();
  }

  select() {
    this.input?.select();
  }

  private autoFitHeight() {
    const { rows, maxRows } = this.props;
    const textArea = this.input;

    if (!(textArea instanceof HTMLTextAreaElement)) {
      return;
    }

    const lineHeight = parseFloat(window.getComputedStyle(textArea).lineHeight);
    const rowsCount = (this.getValue().match(/\n/g) || []).length + 1;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const height = lineHeight * Math.min(Math.max(rowsCount, rows!), maxRows!);

    textArea.style.height = `${height}px`;
  }

  private validationId?: string;

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

      if (isAsyncValidator(validator)) {
        if (!validationId) {
          this.validationId = validationId = uniqueId("validation_id_");
        }
        asyncValidators.push(
          validator.validate(value, this.props).then(
            () => null, // don't consider any valid result from promise since we interested in errors only
            error => this.getValidatorError(value, validator) || error,
          ),
        );
      } else {
        if (!validator.validate(value, this.props)) {
          errors.push(this.getValidatorError(value, validator));
        }
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

    this.input?.setCustomValidity(errors[0]?.toString() ?? "");
  }

  setValidation(errors: React.ReactNode[]) {
    this.setState({
      validating: false,
      valid: !errors.length,
      errors,
    });
  }

  private getValidatorError(value: string, { message }: InputValidator<boolean>) {
    if (isFunction(message)) return message(value, this.props);

    return message || "";
  }

  private setupValidators() {
    const persistentValidators = conditionalValidators
      // add conditional validators if matches input props
      .filter(validator => validator.condition?.(this.props));
    const selfValidators = this.props.validators ? [this.props.validators].flat() : [];

    this.validators = [
      ...persistentValidators,
      ...selfValidators,
    ].map((validator) => {
      if (isAsyncValidator(validator)) {
        validator.validate = debouncePromise(validator.validate, validator.debounce);
      }

      return validator;
    });

    // run validation
    this.validate();
  }

  setDirty(dirty = true) {
    this.setState({ dirty });
  }

  onFocus(evt: React.FocusEvent<InputElement>) {
    const { onFocus, autoSelectOnFocus } = this.props;

    onFocus?.(evt);
    if (autoSelectOnFocus) this.select();
    this.setState({ focused: true });
  }

  onBlur(evt: React.FocusEvent<InputElement>) {
    this.props.onBlur?.(evt);
    this.setState({ focused: false });
  }

  setDirtyOnChange = debounce(() => this.setDirty(), 500);

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

    if (!theme) {
      return {};
    }

    return {
      theme: true,
      round: true,
      black: theme === "round-black",
    };
  }

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
    const componentId = id || showErrorsAsTooltip
      ? getRandId({ prefix: "input_tooltip_id" })
      : undefined;
    let tooltipError: React.ReactNode;

    if (showErrorsAsTooltip && showErrors) {
      const tooltipProps = typeof showErrorsAsTooltip === "object" ? showErrorsAsTooltip : {};

      tooltipProps.className = cssNames("InputTooltipError", tooltipProps.className);
      tooltipError = (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <Tooltip targetId={componentId!} {...tooltipProps}>
          <div className="flex gaps align-center">
            <Icon material="error_outline" />
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
          {multiLine
            ? <textarea {...inputProps as never} />
            : <input {...inputProps as never} />
          }
          {this.renderIcon(iconRight)}
          {contentRight}
        </label>
        <div className="input-info flex gaps">
          {!showErrorsAsTooltip && showErrors && errorsInfo}
          {this.showMaxLenIndicator && (
            <div className="maxLengthIndicator box right">
              {this.getValue().length}
              {" / "}
              {maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
}
