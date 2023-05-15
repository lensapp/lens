/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./input.scss";

import type { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import React from "react";
import type { StrictReactNode, SingleOrMany } from "@k8slens/utilities";
import { debouncePromise, isPromiseSettledFulfilled, cssNames } from "@k8slens/utilities";
import { Icon } from "@k8slens/icon";
import type { TooltipProps } from "@k8slens/tooltip";
import { Tooltip } from "@k8slens/tooltip";
import * as Validators from "./input_validators";
import type { InputValidator, InputValidation, InputValidationResult, SyncValidationMessage } from "./input_validators";
import uniqueId from "lodash/uniqueId";
import { debounce } from "lodash";
import * as uuid from "uuid";
import autoBindReact from "auto-bind/react";

const {
  conditionalValidators,
  asyncInputValidator,
  inputValidator,
  isAsyncValidator,
  unionInputValidatorsAsync,
  ...InputValidators
} = Validators;

export {
  InputValidators,
  asyncInputValidator,
  inputValidator,
  isAsyncValidator,
  unionInputValidatorsAsync,
};
export type {
  InputValidator,
  InputValidation,
  InputValidationResult,
  SyncValidationMessage,
};

type InputElement = HTMLInputElement | HTMLTextAreaElement;
type InputElementProps =
  InputHTMLAttributes<HTMLInputElement>
  & TextareaHTMLAttributes<HTMLTextAreaElement>
  & DOMAttributes<InputElement>;

export interface IconDataFnArg {
  isDirty: boolean;
}

/**
 * One of the following:
 * - A material icon name
 * - A react node
 * - Or a function that produces a react node
 */
export type IconData = string | StrictReactNode | ((opt: IconDataFnArg) => StrictReactNode);

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
  contentRight?: string | StrictReactNode; // Any component of string goes after iconRight
  validators?: SingleOrMany<InputValidator>;
  blurOnEnter?: boolean;
  onChange?(value: string, evt: React.ChangeEvent<InputElement>): void;
  onSubmit?(value: string, evt: React.KeyboardEvent<InputElement>): void;
};

interface State {
  focused: boolean;
  dirty: boolean;
  valid: boolean;
  validating: boolean;
  errors: StrictReactNode[];
  submitted: boolean;
}

const defaultProps: Partial<InputProps> = {
  rows: 1,
  maxRows: 10000,
  showValidationLine: true,
  validators: [],
  blurOnEnter: true,
};

export class Input extends React.Component<InputProps, State> {
  static defaultProps = defaultProps as object;

  public input: InputElement | null = null;
  public validators: InputValidator[] = [];

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
    autoBindReact(this);
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
    const asyncValidators: Promise<StrictReactNode>[] = [];
    const errors: StrictReactNode[] = [];

    // run validators
    for (const validator of this.validators) {
      if (errors.length) {
        // stop validation check if there is an error already
        break;
      }

      const result = validator.validate(value, this.props);

      if (typeof result === "boolean" && !result) {
        errors.push(this.getValidatorError(value, validator));
      } else if (result instanceof Promise) {
        if (!validationId) {
          this.validationId = validationId = uniqueId("validation_id_");
        }
        asyncValidators.push((async () => {
          try {
            await validator.validate(value, this.props);

            return undefined;
          } catch (error) {
            return this.getValidatorError(value, validator) || (error instanceof Error ? error.message : String(error));
          }
        })());
      }
    }

    // save sync validators result first
    this.setValidation(errors);

    // handle async validators result
    if (asyncValidators.length > 0) {
      this.setState({ validating: true, valid: false });
      const asyncErrors = await Promise.allSettled(asyncValidators);

      if (this.validationId === validationId) {
        errors.push(...asyncErrors
          .filter(isPromiseSettledFulfilled)
          .map(res => res.value)
          .filter(Boolean));

        this.setValidation(errors);
      }
    }

    this.input?.setCustomValidity(errors[0]?.toString() ?? "");
  }

  setValidation(errors: StrictReactNode[]) {
    this.setState({
      validating: false,
      valid: !errors.length,
      errors,
    });
  }

  private getValidatorError(value: string, { message }: InputValidator) {
    return typeof message === "function"
      ? message(value, this.props)
      : message;
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

  async onChange(evt: React.ChangeEvent<any>) {
    const newValue = evt.currentTarget.value;
    const eventCopy = { ...evt };

    this.autoFitHeight();
    this.setDirtyOnChange();

    // Handle uncontrolled components (`props.defaultValue` must be used instead `value`)
    if (this.isUncontrolled) {
      // update DOM since render() is not called on input's changes with uncontrolled inputs
      if (this.showMaxLenIndicator) this.forceUpdate();

      // don't propagate changes for invalid values
      await this.validate();
      if (!this.state.valid) return; // skip
    }

    // emit new value update
    this.props.onChange?.(newValue, eventCopy);
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

      if (this.props.blurOnEnter) {
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
      ? `input_tooltip_id_${uuid.v4()}`
      : undefined;
    let tooltipError: StrictReactNode;

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
            ? <textarea {...inputProps as object} />
            : <input {...inputProps as object} />
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
