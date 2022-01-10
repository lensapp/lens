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

import type { InputProps } from "./input";
import type { ReactNode } from "react";
import fse from "fs-extra";

export interface InputValidator {
  debounce?: number; // debounce for async validators in ms
  condition?(props: InputProps): boolean; // auto-bind condition depending on input props
  message?: ReactNode | ((value: string, props?: InputProps) => ReactNode | string);
  validate(value: string, props?: InputProps): boolean | Promise<any>; // promise can throw error message
}

export const isRequired: InputValidator = {
  condition: ({ required }) => required,
  message: () => `This field is required`,
  validate: value => !!value.trim(),
};

export const isEmail: InputValidator = {
  condition: ({ type }) => type === "email",
  message: () => `Wrong email format`,
  validate: value => !!value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
};

export const isNumber: InputValidator = {
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
};

export const isUrl: InputValidator = {
  condition: ({ type }) => type === "url",
  message: () => `Wrong url format`,
  validate: value => {
    try {
      return Boolean(new URL(value));
    } catch (err) {
      return false;
    }
  },
};

export const isExtensionNameInstallRegex = /^(?<name>(@[-\w]+\/)?[-\w]+)(@(?<version>[a-z0-9-_.]+))?$/gi;

export const isExtensionNameInstall: InputValidator = {
  condition: ({ type }) => type === "text",
  message: () => "Not an extension name with optional version",
  validate: value => value.match(isExtensionNameInstallRegex) !== null,
};

export const isPath: InputValidator = {
  condition: ({ type }) => type === "text",
  message: () => `This field must be a valid path`,
  validate: value => value && fse.pathExistsSync(value),
};

export const minLength: InputValidator = {
  condition: ({ minLength }) => !!minLength,
  message: (value, { minLength }) => `Minimum length is ${minLength}`,
  validate: (value, { minLength }) => value.length >= minLength,
};

export const maxLength: InputValidator = {
  condition: ({ maxLength }) => !!maxLength,
  message: (value, { maxLength }) => `Maximum length is ${maxLength}`,
  validate: (value, { maxLength }) => value.length <= maxLength,
};

const systemNameMatcher = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const systemName: InputValidator = {
  message: () => `A System Name must be lowercase DNS labels separated by dots. DNS labels are alphanumerics and dashes enclosed by alphanumerics.`,
  validate: value => !!value.match(systemNameMatcher),
};

export const accountId: InputValidator = {
  message: () => `Invalid account ID`,
  validate: value => (isEmail.validate(value) || systemName.validate(value)),
};

export const conditionalValidators = [
  isRequired, isEmail, isNumber, isUrl, minLength, maxLength,
];
