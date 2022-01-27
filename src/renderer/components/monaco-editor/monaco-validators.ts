/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import yaml from "js-yaml";

export interface MonacoValidator {
  (value: string): void;
}

export function yamlValidator(value: string) {
  try {
    yaml.loadAll(value);
  } catch (error) {
    throw String(error);
  }
}

export function jsonValidator(value: string) {
  try {
    JSON.parse(value);
  } catch (error) {
    throw String(error);
  }
}

export const monacoValidators = {
  yaml: yamlValidator,
  json: jsonValidator,
};
