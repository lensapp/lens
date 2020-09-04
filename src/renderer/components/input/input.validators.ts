import type { InputProps } from "./input";
import { ReactNode } from "react";
import { t } from "@lingui/macro";
import { _i18n } from '../../i18n';
import fse from "fs-extra";

export interface Validator {
  debounce?: number; // debounce for async validators in ms
  condition?(props: InputProps): boolean; // auto-bind condition depending on input props
  message?: ReactNode | ((value: string, props?: InputProps) => ReactNode | string);
  validate(value: string, props?: InputProps): boolean | Promise<any>; // promise can throw error message
}

export const isRequired: Validator = {
  condition: ({ required }) => required,
  message: () => _i18n._(t`This field is required`),
  validate: value => !!value.trim(),
};

export const isEmail: Validator = {
  condition: ({ type }) => type === "email",
  message: () => _i18n._(t`Wrong email format`),
  validate: value => !!value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
};

export const isNumber: Validator = {
  condition: ({ type }) => type === "number",
  message: () => _i18n._(t`Invalid number`),
  validate: (value, { min, max }) => {
    const numVal = +value;
    return !(
      isNaN(numVal) ||
      (min != null && numVal < min) ||
      (max != null && numVal > max)
    )
  },
};

export const isUrl: Validator = {
  condition: ({ type }) => type === "url",
  message: () => _i18n._(t`Wrong url format`),
  validate: value => !!value.match(/^http(s)?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]*)*$/),
};

export const isPath: Validator = {
  condition: ({ type }) => type === "text",
  message: () => _i18n._(t`This field must be a path to an existing file`),
  validate: value => !value || fse.pathExistsSync(value),
}

export const minLength: Validator = {
  condition: ({ minLength }) => !!minLength,
  message: (value, { minLength }) => _i18n._(t`Minimum length is ${minLength}`),
  validate: (value, { minLength }) => value.length >= minLength,
};

export const maxLength: Validator = {
  condition: ({ maxLength }) => !!maxLength,
  message: (value, { maxLength }) => _i18n._(t`Maximum length is ${maxLength}`),
  validate: (value, { maxLength }) => value.length <= maxLength,
};

const systemNameMatcher = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
export const systemName: Validator = {
  message: () => _i18n._(t`A System Name must be lowercase DNS labels separated by dots. DNS labels are alphanumerics and dashes enclosed by alphanumerics.`),
  validate: value => !!value.match(systemNameMatcher),
};

export const accountId: Validator = {
  message: () => _i18n._(t`Invalid account ID`),
  validate: value => (isEmail.validate(value) || systemName.validate(value))
};

export const conditionalValidators = [
  isRequired, isEmail, isNumber, isUrl, minLength, maxLength
];