/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InputProps } from "./input";
import type { ReactNode } from "react";
import fse from "fs-extra";
import { TypedRegEx } from "typed-regex";

export class AsyncInputValidationError extends Error {}

export type InputValidator<IsAsync extends boolean> = {
  /**
   * Filters itself based on the input props
   */
  condition?: (props: InputProps) => any;
} & (
  IsAsync extends false
    ? {
      validate: (value: string, props: InputProps) => boolean;
      message: ReactNode | ((value: string, props: InputProps) => ReactNode | string);
      debounce?: undefined;
    }
    : {
      /**
       * If asyncronous then the rejection message is the error message
       *
       * This function MUST reject with an instance of {@link AsyncInputValidationError}
       */
      validate: (value: string, props: InputProps) => Promise<void>;
      message?: undefined;
      debounce: number;
    }
);

export function inputValidator<IsAsync extends boolean = false>(validator: InputValidator<IsAsync>): InputValidator<IsAsync> {
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

export const isNumber = inputValidator({
  condition: ({ type }) => type === "number",
  message: () => `Invalid number`,
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
  captures(val: string): undefined | { name: string; version?: string | undefined };
};

export const isExtensionNameInstall = inputValidator({
  condition: ({ type }) => type === "text",
  message: () => "Not an extension name with optional version",
  validate: value => isExtensionNameInstallRegex.isMatch(value),
});

export const isPath = inputValidator<true>({
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

export const minLength = inputValidator({
  condition: ({ minLength }) => !!minLength,
  message: (value, { minLength }) => `Minimum length is ${minLength}`,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  validate: (value, { minLength }) => value.length >= minLength!,
});

export const maxLength = inputValidator({
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
  validate: (value, props) => (isEmail.validate(value, props) || systemName.validate(value, props)),
});

export const conditionalValidators = [
  isRequired, isEmail, isNumber, isUrl, minLength, maxLength,
];
