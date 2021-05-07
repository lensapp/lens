import type { InputProps } from "./input";
import { ReactNode } from "react";
import fse from "fs-extra";

export type ValidatorMessage = ReactNode | ((value: string, props?: InputProps) => ReactNode | string);

export interface ConditionalInputValidator extends InputValidator {
  condition(props: InputProps): boolean; // auto-bind condition depending on input props
}

export interface InputValidator {
  condition?(props: InputProps): boolean; // auto-bind condition depending on input props
  message: ValidatorMessage;
  validate(value: string, props?: InputProps): boolean;
}

export interface AsyncInputValidator {
  condition?(props: InputProps): boolean; // auto-bind condition depending on input props
  message: ValidatorMessage;
  validate(value: string, props?: InputProps): Promise<boolean>;
}

export const isRequired: ConditionalInputValidator = {
  condition: ({ required }) => required,
  message: "This field is required",
  validate: value => !!value.trim(),
};

export const isEmail: ConditionalInputValidator = {
  condition: ({ type }) => type === "email",
  message: "Must be an email",
  validate: value => !!value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
};

export const isNumber: ConditionalInputValidator = {
  condition: ({ type }) => type === "number",
  message: "Must be a number",
  validate: (value, { min, max }) => {
    const numVal = +value;

    return !(
      isNaN(numVal) ||
      (min != null && numVal < min) ||
      (max != null && numVal > max)
    );
  },
};

export const isUrl: ConditionalInputValidator = {
  condition: ({ type }) => type === "url",
  message: "Must be a valid URL",
  validate: value => {
    try {
      return Boolean(new URL(value));
    } catch (err) {
      return false;
    }
  },
};

export const isExtensionNameInstallRegex = /^(?<name>(@[-\w]+\/)?[-\w]+)(@(?<version>\d\.\d\.\d(-\w+)?))?$/gi;

export const isExtensionNameInstall: ConditionalInputValidator = {
  condition: ({ type }) => type === "text",
  message: "Not an extension name with optional version",
  validate: value => value.match(isExtensionNameInstallRegex) !== null,
};

export const isPath: AsyncInputValidator = {
  condition: ({ type }) => type === "text",
  message: "This field must be a path to an existing file.",
  validate: async value => {
    try {
      await fse.stat(value);

      return true;
    } catch (err) {
      return false;
    }
  },
};

export const minLength: ConditionalInputValidator = {
  condition: ({ minLength }) => !!minLength,
  message: (value, { minLength }) => `Minimum length is ${minLength}`,
  validate: (value, { minLength }) => value.length >= minLength,
};

export const maxLength: ConditionalInputValidator = {
  condition: ({ maxLength }) => !!maxLength,
  message: (value, { maxLength }) => `Maximum length is ${maxLength}`,
  validate: (value, { maxLength }) => value.length <= maxLength,
};

const systemNameMatcher = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const systemName: InputValidator = {
  message: "A System Name must be lowercase DNS labels separated by dots. DNS labels are alphanumerics and dashes enclosed by alphanumerics.",
  validate: value => !!value.match(systemNameMatcher),
};

export const namespaceValue: InputValidator = {
  message: "A Namespace must be lowercase DNS labels separated by dots. DNS labels are alphanumerics and dashes enclosed by alphanumerics.",
  validate: value => !!value.match(systemNameMatcher),
};

export const accountId: InputValidator = {
  message: "Invalid account ID",
  validate: value => (isEmail.validate(value) || systemName.validate(value))
};

export const conditionalValidators: ConditionalInputValidator[] = [
  isRequired, isEmail, isNumber, isUrl, minLength, maxLength
];
