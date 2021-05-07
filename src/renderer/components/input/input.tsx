import "./input.scss";

import React, { DOMAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { autobind, cssNames, getRandId } from "../../utils";
import { Icon } from "../icon";
import { Tooltip, TooltipProps } from "../tooltip";
import * as Validators from "./input_validators";
import { AsyncInputValidator, InputValidator, ValidatorMessage } from "./input_validators";
import isString from "lodash/isString";
import { action, computed, observable } from "mobx";
import { debounce } from "lodash";
import { observer } from "mobx-react";

const { conditionalValidators, ...InputValidators } = Validators;

export { InputValidators, InputValidator, AsyncInputValidator };

type InputElement = HTMLInputElement | HTMLTextAreaElement;
type InputElementProps = InputHTMLAttributes<InputElement> & TextareaHTMLAttributes<InputElement> & DOMAttributes<InputElement>;

export type InputProps<T = string> = Omit<InputElementProps, "onChange" | "onSubmit"> & {
  theme?: "round-black";
  className?: string;
  value?: T;
  autoSelectOnFocus?: boolean
  multiLine?: boolean; // use text-area as input field
  maxRows?: number; // when multiLine={true} define max rows size
  showErrorInitially?: boolean; // show validation errors even if the field wasn't touched yet
  showErrorsAsTooltip?: boolean | Omit<TooltipProps, "targetId">; // show validation errors as a tooltip :hover (instead of block below)
  iconLeft?: string | React.ReactNode; // material-icon name in case of string-type
  iconRight?: string | React.ReactNode;
  contentRight?: string | React.ReactNode; // Any component of string goes after iconRight
  validators?: InputValidator | InputValidator[];
  asyncValidators?: AsyncInputValidator | AsyncInputValidator[];
  onChange?(value: T, evt: React.ChangeEvent<InputElement>): void;
  onSubmit?(value: T): void;
};

const defaultProps: Partial<InputProps> = {
  rows: 1,
  maxRows: 10000,
  validators: [],
  showErrorInitially: false,
};

@observer
export class Input extends React.Component<InputProps> {
  static defaultProps = defaultProps as object;

  public inputRef = React.createRef<InputElement>();
  public validators: InputValidator[] = [];
  public asyncValidators: AsyncInputValidator[] = [];

  @observable errors: React.ReactNode[] = [];
  @observable dirty = Boolean(this.props.showErrorInitially);
  @observable focused = false;
  @observable asyncValidating = false;
  @observable isSubmitting = false;

  @computed get isValid() {
    return this.errors.length === 0;
  }

  componentDidMount() {
    const { validators, asyncValidators, showErrorInitially } = this.props;

    this.validators = conditionalValidators
      // add conditional validators if matches input props
      .filter(validator => validator.condition(this.props))
      // add custom validators
      .concat(validators);

    this.asyncValidators = [asyncValidators].flat();

    if (showErrorInitially) {
      this.runValidatorsRaw(this.getValue());
    }

    this.autoFitHeight();
  }

  setValue(value: string) {
    if (value !== this.getValue()) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(this.inputRef.constructor.prototype, "value").set;

      nativeInputValueSetter.call(this.inputRef, value);
      const evt = new Event("input", { bubbles: true });

      this.inputRef.current.dispatchEvent(evt);
    }
  }

  getValue(): string {
    const { value, defaultValue = "" } = this.props;

    if (value !== undefined) return value; // controlled input
    if (this.inputRef) return this.inputRef.current.value; // uncontrolled input

    return defaultValue as string;
  }

  focus() {
    this.inputRef.current.focus();
  }

  blur() {
    this.inputRef.current.blur();
  }

  select() {
    this.inputRef.current.select();
  }

  private autoFitHeight() {
    const { multiLine, rows, maxRows } = this.props;

    if (!multiLine) {
      return;
    }

    const textArea = this.inputRef.current;
    const lineHeight = parseFloat(window.getComputedStyle(textArea).lineHeight);
    const rowsCount = (this.getValue().match(/\n/g) || []).length + 1;
    const height = lineHeight * Math.min(Math.max(rowsCount, rows), maxRows);

    textArea.style.height = `${height}px`;
  }

  private resolveValidatorMessage(message: ValidatorMessage, value: string): React.ReactNode {
    return typeof message === "function"
      ? message(value, this.props)
      : message;
  }

  /**
   * This function should only be run before submitting.
   */
  async runAsyncValidators(value: string): Promise<React.ReactNode[]> {
    if (this.asyncValidators.length === 0) {
      return [];
    }

    try {
      this.asyncValidating = true;

      return (await Promise.all(
        this.asyncValidators.map(validator => (
          validator.validate(value, this.props)
            .then(isValid => {
              if (!isValid) {
                return [this.resolveValidatorMessage(validator.message, value)];
              }

              return [];
            })
            .catch(error => Promise.resolve<React.ReactNode[]>([error, this.resolveValidatorMessage(validator.message, value)]))
        )),
      )).flat();
    } finally {
      this.asyncValidating = false;
    }
  }

  @action
  runValidatorsRaw(value: string) {
    this.errors = [];

    // run validators
    for (const validator of this.validators) {
      const isValid = validator.validate(value, this.props);

      if (!isValid) {
        if (typeof validator.message === "function") {
          this.errors.push(validator.message(value, this.props));
        } else {
          this.errors.push(validator.message);
        }
      }
    }

    this.inputRef.current.setCustomValidity(this.errors.length ? this.errors[0].toString() : "");
  }

  runValidators = debounce(() => this.runValidatorsRaw(this.getValue()), 500, {
    trailing: true,
    leading: false,
  });

  validate() {
    this.errors = [];
    this.runValidators();
  }

  @autobind()
  onFocus(evt: React.FocusEvent<InputElement>) {
    const { onFocus, autoSelectOnFocus } = this.props;

    onFocus?.(evt);

    if (autoSelectOnFocus) {
      this.select();
    }

    this.focused = true;
  }

  @autobind()
  onBlur(evt: React.FocusEvent<InputElement>) {
    this.props.onBlur?.(evt);
    this.focused = false;
  }

  @autobind()
  onChange(evt: React.ChangeEvent<InputElement>) {
    this.props.onChange?.(evt.currentTarget.value, evt);
    this.validate();
    this.autoFitHeight();

    // re-render component when used as uncontrolled input
    // when used @defaultValue instead of @value changing real input.value doesn't call render()
    if (this.isUncontrolled && this.showMaxLenIndicator) {
      this.forceUpdate();
    }
  }

  @autobind()
  onKeyDown(evt: React.KeyboardEvent<InputElement>) {
    this.props.onKeyDown?.(evt);

    const modified = evt.shiftKey || evt.metaKey || evt.altKey || evt.ctrlKey;

    if (!modified && evt.key === "Enter") {
      const value = this.getValue();

      this.isSubmitting = true;
      this.runValidatorsRaw(value);

      if (!this.isValid) {
        return this.isSubmitting = false;
      }

      this.runAsyncValidators(value)
        .then(errors => {
          this.errors.push(...errors);

          if (this.isValid) {
            this.props.onSubmit?.(value);
          }

          this.isSubmitting = false;
        });
    }
  }

  get showMaxLenIndicator() {
    const { maxLength, multiLine } = this.props;

    return maxLength && multiLine;
  }

  get isUncontrolled() {
    return this.props.value === undefined;
  }

  render() {
    const {
      multiLine, validators, theme, maxRows, children, showErrorsAsTooltip,
      maxLength, rows, disabled, autoSelectOnFocus, iconLeft, iconRight, contentRight, id,
      onChange, onSubmit, asyncValidators, showErrorInitially, ...inputPropsRaw
    } = this.props;
    const className = cssNames("Input", this.props.className, {
      [`theme ${theme}`]: theme,
      focused: this.focused,
      disabled,
      invalid: !this.isValid,
      dirty: this.dirty,
      waiting: this.asyncValidating,
    });
    const inputProps: InputElementProps = {
      ...inputPropsRaw,
      className: "input box grow",
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      spellCheck: "false",
      disabled: disabled || this.isSubmitting,
    };
    const showErrors = this.errors.length > 0;
    const errorsInfo = (
      <div className="errors box grow">
        {this.errors.map((error, i) => <p key={i}>{error}</p>)}
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
          {
            multiLine
              ? <textarea
                ref={this.inputRef as React.RefObject<HTMLTextAreaElement>}
                rows={rows || 1}
                {...inputProps}
              />
              : <input
                ref={this.inputRef as React.RefObject<HTMLInputElement>}
                {...inputProps}
              />
          }
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
