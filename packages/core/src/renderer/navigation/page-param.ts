/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Manage observable param from document's location.search
import { action, makeObservable } from "mobx";
import type { ObservableHistory } from "mobx-observable-history";

export interface PageParamInit<Value = any> {
  name: string;
  defaultValue?: Value; // multi-values param must be defined with array-value, e.g. []
  parse?(value: string | string[]): Value; // from URL
  stringify?(value: Value): string | string[]; // to URL
}

export interface PageParamDependencies {
  readonly history: ObservableHistory<unknown>;
}

// TODO: write tests
export class PageParam<Value = any> {
  readonly name: string;
  readonly isMulti: boolean;

  constructor(protected readonly dependencies: PageParamDependencies, private init: PageParamInit<Value>) {
    makeObservable(this);
    const { name, defaultValue } = init;

    this.name = name;
    this.isMulti = Array.isArray(defaultValue); // multi-values param
  }

  // should be a getter since `init.defaultValue` could be a getter too
  get defaultValue(): Value | undefined {
    return this.init.defaultValue;
  }

  parse(values: string | string[]): Value {
    const { parse } = this.init;

    if (parse) {
      return parse(values);
    }

    // return as-is ("string"-value based params)
    return values as unknown as Value;
  }

  stringify(value: Value = this.get()): string[] {
    const { stringify } = this.init;

    if (stringify) {
      return [stringify(value)].flat();
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
