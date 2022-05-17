/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InputProps } from "./input";
import type { ReactNode } from "react";
import fse from "fs-extra";
import { TypedRegEx } from "typed-regex";

export class AsyncInputValidationError extends Error {
}

export type InputValidationResult<IsAsync extends boolean> =
  IsAsync extends true
    ? Promise<void>
    : boolean;

export type InputValidation<IsAsync extends boolean, RequireProps extends boolean> = (
  RequireProps extends true
    ? (value: string, props: InputProps) => InputValidationResult<IsAsync>
    : (value: string, props?: InputProps) => InputValidationResult<IsAsync>
);

export type SyncValidationMessageBuilder<RequireProps extends boolean> = (
  RequireProps extends true
    ? (value: string, props: InputProps) => ReactNode
    : (value: string, props?: InputProps) => ReactNode
);

export type InputValidator<IsAsync extends boolean = boolean, RequireProps extends boolean = boolean> = {
  /**
   * Filters itself based on the input props
   */
  condition?: (props: InputProps) => any;
} & (
  IsAsync extends false
    ? {
      validate: InputValidation<false, RequireProps>;
      message: ReactNode | SyncValidationMessageBuilder<RequireProps>;
      debounce?: undefined;
    }
    : {
      /**
       * If asyncronous then the rejection message is the error message
       *
       * This function MUST reject with an instance of {@link AsyncInputValidationError}
       */
      validate: InputValidation<true, RequireProps>;
      message?: undefined;
      debounce: number;
    }
  );

export function asyncInputValidator(validator: InputValidator<true, false>): InputValidator<true, false>;
export function asyncInputValidator<RequireProps extends boolean>(validator: InputValidator<true, RequireProps>): InputValidator<true, RequireProps>;

export function asyncInputValidator<RequireProps extends boolean>(validator: InputValidator<true, RequireProps>): InputValidator<true, RequireProps> {
  return validator;
}

export function inputValidator(validator: InputValidator<false, false>): InputValidator<false, false>;
export function inputValidator<RequireProps extends boolean>(validator: InputValidator<false, RequireProps>): InputValidator<false, RequireProps>;

export function inputValidator<RequireProps extends boolean>(validator: InputValidator<false, RequireProps>): InputValidator<false, RequireProps> {
  return validator;
}

export const isRequired = inputValidator({
  condition: ({ required }) => required,
  message: () => `This field is required`,
  validate: value => !!value.trim(),
});

export const isEmail = inputValidator({
  condition: ({ type }) => type === "email",
  message: () => `Wrong email format`,
  validate: value => !!value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
});

export const isNumber = inputValidator<true>({
  condition: ({ type }) => type === "number",
  message(value, { min, max }) {
    const minMax: string = [
      typeof min === "number" ? `min: ${min}` : undefined,
      typeof max === "number" ? `max: ${max}` : undefined,
    ].filter(Boolean).join(", ");

    return `Invalid number${minMax ? ` (${minMax})` : ""}`;
  },
  validate: (value, { min, max }) => {
    const numVal = +value;

    return !(
      isNaN(numVal) ||
      (min != null && numVal < min) ||
      (max != null && numVal > max)
    );
  },
});

export const isUrl = inputValidator({
  condition: ({ type }) => type === "url",
  message: () => `Wrong url format`,
  validate: value => {
    try {
      return Boolean(new URL(value));
    } catch (err) {
      return false;
    }
  },
});

/**
 * NOTE: this cast is needed because of two bugs in the typed regex package
 * - https://github.com/phenax/typed-regex/issues/6
 * - https://github.com/phenax/typed-regex/issues/7
 */
export const isExtensionNameInstallRegex = TypedRegEx("^(?<name>(@[-\\w]+\\/)?[-\\w]+)(@(?<version>[a-z0-9-_.]+))?$", "gi") as {
  isMatch(val: string): boolean;
  captures(val: string): undefined | { name: string; version?: string };
};

export const isExtensionNameInstall = inputValidator({
  condition: ({ type }) => type === "text",
  message: () => "Not an extension name with optional version",
  validate: value => isExtensionNameInstallRegex.isMatch(value),
});

export const isPath = asyncInputValidator({
  debounce: 100,
  condition: ({ type }) => type === "text",
  validate: async value => {
    try {
      await fse.pathExists(value);
    } catch {
      throw new AsyncInputValidationError(`${value} is not a valid file path`);
    }
  },
});

export const minLength = inputValidator<true>({
  condition: ({ minLength }) => !!minLength,
  message: (value, { minLength }) => `Minimum length is ${minLength}`,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  validate: (value, { minLength }) => value.length >= minLength!,
});

export const maxLength = inputValidator<true>({
  condition: ({ maxLength }) => !!maxLength,
  message: (value, { maxLength }) => `Maximum length is ${maxLength}`,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  validate: (value, { maxLength }) => value.length <= maxLength!,
});

const systemNameMatcher = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const systemName = inputValidator({
  message: () => `A System Name must be lowercase DNS labels separated by dots. DNS labels are alphanumerics and dashes enclosed by alphanumerics.`,
  validate: value => !!value.match(systemNameMatcher),
});

export const accountId = inputValidator({
  message: () => `Invalid account ID`,
  validate: (value) => (isEmail.validate(value) || systemName.validate(value)),
});

export const conditionalValidators = [
  isRequired, isEmail, isNumber, isUrl, minLength, maxLength,
];
