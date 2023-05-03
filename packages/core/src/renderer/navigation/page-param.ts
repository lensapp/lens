/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Manage observable param from document's location.search
import { action, makeObservable } from "mobx";
import type { ObservableHistory } from "mobx-observable-history";

export interface WithName {
  readonly name: string;
}

export interface ArrayPageParamDeclaration<InnerValue> {
  readonly defaultValue: InnerValue[];
  parse?: (value: string[]) => InnerValue[] | undefined;
  stringify?: (value: InnerValue[]) => string | string[] | undefined;
}

export interface StringPageParamDeclaration<Value> {
  readonly defaultValue?: Value;
  parse?: (value: string) => Value | undefined;
  stringify?: (value: Value) => string | undefined;
}

export interface DefaultPageParamDeclaration<Value> {
  readonly defaultValue?: Value;
  parse: (value: string) => Value | undefined;
  stringify: (value: Value) => string | undefined;
}

export type FallthroughPageParamDeclaration = (DefaultPageParamDeclaration<unknown> | StringPageParamDeclaration<string> | ArrayPageParamDeclaration<unknown>);

export type PageParamDeclaration<Value> = (
  Value extends string
  ? StringPageParamDeclaration<Value>
  : Value extends Array<infer InnerValue>
    ? ArrayPageParamDeclaration<InnerValue>
    : DefaultPageParamDeclaration<Value>
);

export function getPageParamDeclaration<Value>(decl: PageParamDeclaration<Value>): PageParamDeclaration<Value> {
  return decl;
}

/**
 * @deprecated Switch to {@link PageParamDeclaration} and {@link getPageParamDeclaration} instead
 */
export interface PageParamInit<Value> {
  name: string;
  defaultValue?: Value; // multi-values param must be defined with array-value, e.g. []
  parse?: (value: string | string[]) => Value; // from URL
  stringify?: (value: Value) => string | string[]; // to URL
}

export interface PageParamDependencies {
  readonly history: ObservableHistory<unknown>;
}

export class PageParam<Value> {
  readonly name: string;
  readonly isMulti: boolean;

  constructor(protected readonly dependencies: PageParamDependencies, private readonly init: PageParamDeclaration<Value> & WithName) {
    makeObservable(this);
    const { name, defaultValue } = init;

    this.name = name;
    this.isMulti = Array.isArray(defaultValue); // multi-values param
  }

  // should be a getter since `init.defaultValue` could be a getter too
  get defaultValue(): Value | undefined {
    return this.init.defaultValue as Value | undefined;
  }

  parse(values: string | string[]): Value {
    const { parse } = this.init;

    if (parse) {
      return parse(values as never) as Value;
    }

    // return as-is ("string"-value based params)
    return values as unknown as Value;
  }

  stringify(value: Value = this.get()): string[] {
    const { stringify } = this.init;

    if (stringify) {
      return [stringify(value as never)].flat() as string[];
    }

    return [value].flat().map(String);
  }

  get(): Value {
    // TODO: cleanup
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.parse(this.getRaw()) ?? this.defaultValue!;
  }

  @action
  set(value: Value, { mergeGlobals = true, replaceHistory = false } = {}): void {
    const search = this.toString({ mergeGlobals, value });

    this.dependencies.history.merge({ search }, replaceHistory);
  }

  /**
   * Set stringified raw value(s) and update `document.location.search`
   * @param {string | string[]} value
   */
  @action
  setRaw(value: string | string[]): void {
    const values: string[] = [value].flat();

    if (this.isMulti) {
      this.clear();
      values.forEach(value => {
        this.dependencies.history.searchParams.append(this.name, value);
      });
    } else {
      this.dependencies.history.searchParams.set(this.name, values[0]);
    }
  }

  /**
   * Get stringified raw value(s) from `document.location.search`
   */
  getRaw(): string | string[] {
    const values: string[] = this.dependencies.history.searchParams.getAll(this.name);

    return this.isMulti ? values : values[0];
  }

  @action
  clear() {
    this.dependencies.history.searchParams.delete(this.name);
  }

  toString({ mergeGlobals = true, value = this.get() } = {}): string {
    let searchParams = new URLSearchParams();

    if (mergeGlobals) {
      searchParams = new URLSearchParams(this.dependencies.history.searchParams);
      searchParams.delete(this.name);
    }

    this.stringify(value).forEach(value => {
      searchParams.append(this.name, value);
    });

    return searchParams.toString();
  }
}
