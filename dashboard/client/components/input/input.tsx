import "./input.scss";

import React, { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { autobind, cssNames, debouncePromise } from "../../utils";
import { Icon } from "../icon";
import { conditionalValidators, Validator } from "./input.validators";
import isString from "lodash/isString"
import isFunction from "lodash/isFunction"
import isBoolean from "lodash/isBoolean"
import uniqueId from "lodash/uniqueId"

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type InputElement = HTMLInputElement | HTMLTextAreaElement;
type InputElementProps = InputHTMLAttributes<InputElement> & TextareaHTMLAttributes<InputElement> & DOMAttributes<InputElement>;

export type InputProps<T = string> = Omit<InputElementProps, "onChange"> & {
  theme?: "round-black";
  className?: string;
  value?: T;
  multiLine?: boolean; // use text-area as input field
  maxRows?: number; // when multiLine={true} define max rows size
  dirty?: boolean; // show validation errors even if the field wasn't touched yet
  showValidationLine?: boolean; // show animated validation line for async validators
  iconLeft?: string | React.ReactNode; // material-icon name in case of string-type
  iconRight?: string | React.ReactNode;
  validators?: Validator | Validator[];
  onChange?(value: T, evt: React.ChangeEvent<InputElement>): void;
}

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
}

export class Input extends React.Component<InputProps, State> {
  static defaultProps = defaultProps as object;

  public input: InputElement;
  public validators: Validator[] = [];

  public state: State = {
    dirty: !!this.props.dirty,
    valid: true,
    errors: [],
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
    this.input.select()
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
    textArea.style.height = height + "px";
  }

  private validationId: string;

  async validate(value = this.getValue()) {
    let validationId = (this.validationId = ""); // reset every time for async validators
    const asyncValidators: Promise<any>[] = [];
    let errors: React.ReactNode[] = [];

    // run validators
    for (const validator of this.validators) {
      if (errors.length) {
        // stop validation check if there is an error already
        break;
      }
      const result = validator.validate(value, this.props);
      if (isBoolean(result) && !result) {
        errors.push(this.getValidatorError(value, validator));
      }
      else if (result instanceof Promise) {
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
      this.setState({ validating: true, valid: false, });
      const asyncErrors = await Promise.all(asyncValidators);
      const isLastValidationCheck = this.validationId === validationId;
      if (isLastValidationCheck) {
        errors = this.state.errors.concat(asyncErrors.filter(err => err));
        this.setValidation(errors);
      }
    }

    this.input.setCustomValidity(errors.length ? errors[0].toString() : "");
  }

  setValidation(errors: React.ReactNode[]) {
    this.setState({
      validating: false,
      valid: !errors.length,
      errors: errors,
    });
  }

  private getValidatorError(value: string, { message }: Validator) {
    if (isFunction(message)) return message(value, this.props)
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

  @autobind()
  onFocus(evt: React.FocusEvent<InputElement>) {
    const { onFocus } = this.props;
    if (onFocus) onFocus(evt);
    this.setState({ focused: true });
  }

  @autobind()
  onBlur(evt: React.FocusEvent<InputElement>) {
    const { onBlur } = this.props;
    if (onBlur) onBlur(evt);
    if (this.state.dirtyOnBlur) this.setState({ dirty: true, dirtyOnBlur: false });
    this.setState({ focused: false });
  }

  @autobind()
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

  @autobind()
  bindRef(elem: InputElement) {
    this.input = elem;
  }

  render() {
    const { multiLine, showValidationLine, validators, theme, maxRows, children, ...inputProps } = this.props;
    let { className, iconLeft, iconRight } = this.props;
    const { maxLength, rows, disabled } = this.props;
    const { focused, dirty, valid, validating, errors } = this.state;

    className = cssNames("Input", className, {
      [`theme ${theme}`]: theme,
      focused: focused,
      disabled: disabled,
      invalid: !valid,
      dirty: dirty,
      validating: validating,
      validatingLine: validating && showValidationLine,
    });

    // normalize icons
    if (isString(iconLeft)) iconLeft = <Icon material={iconLeft}/>
    if (isString(iconRight)) iconRight = <Icon material={iconRight}/>

    // prepare input props
    Object.assign(inputProps, {
      className: "input box grow",
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      rows: multiLine ? (rows || 1) : null,
      ref: this.bindRef,
    });

    return (
      <div className={className}>
        <label className="input-area flex gaps align-center">
          {iconLeft}
          {multiLine ? <textarea {...inputProps as any}/> : <input {...inputProps as any}/>}
          {iconRight}
        </label>
        <div className="input-info flex gaps">
          {!valid && dirty && (
            <div className="errors box grow">
              {errors.map((error, i) => <p key={i}>{error}</p>)}
            </div>
          )}
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
