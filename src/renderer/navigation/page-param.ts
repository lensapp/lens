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

// Manage observable param from document's location.search
import { action, makeObservable } from "mobx";
import type { ObservableHistory } from "mobx-observable-history";

export interface PageParamInit<V = any> {
  name: string;
  defaultValue?: V; // multi-values param must be defined with array-value, e.g. []
  prefix?: string; // name prefix, for extensions it's `${extension.id}:`
  parse?(value: string | string[]): V; // from URL
  stringify?(value: V): string | string[]; // to URL
}

// TODO: write tests
export class PageParam<V = any> {
  readonly name: string;
  readonly isMulti: boolean;

  constructor(private init: PageParamInit<V>, private history: ObservableHistory) {
    makeObservable(this);
    const { prefix, name, defaultValue } = init;

    this.name = `${prefix ?? ""}${name}`; // actual prefixed URL-name
    this.isMulti = Array.isArray(defaultValue); // multi-values param
  }

  // should be a getter since `init.defaultValue` could be a getter too
  get defaultValue(): V | undefined {
    return this.init.defaultValue;
  }

  parse(values: string | string[]): V {
    const { parse } = this.init;

    if (parse) {
      return parse(values);
    }

    // return as-is ("string"-value based params)
    return values as any as V;
  }

  stringify(value: V = this.get()): string[] {
    const { stringify } = this.init;

    if (stringify) {
      return [stringify(value)].flat();
    }

    return [value].flat().map(String);
  }

  get(): V {
    return this.parse(this.getRaw()) ?? this.defaultValue;
  }

  @action
  set(value: V, { mergeGlobals = true, replaceHistory = false } = {}): void {
    const search = this.toString({ mergeGlobals, value });

    this.history.merge({ search }, replaceHistory);
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
        this.history.searchParams.append(this.name, value);
      });
    } else {
      this.history.searchParams.set(this.name, values[0]);
    }
  }

  /**
   * Get stringified raw value(s) from `document.location.search`
   */
  getRaw(): string | string[] {
    const values: string[] = this.history.searchParams.getAll(this.name);

    return this.isMulti ? values : values[0];
  }

  @action
  clear() {
    this.history.searchParams.delete(this.name);
  }

  toString({ withPrefix = true, mergeGlobals = true, value = this.get() } = {}): string {
    let searchParams = new URLSearchParams();

    if (mergeGlobals) {
      searchParams = new URLSearchParams(this.history.searchParams);
      searchParams.delete(this.name);
    }

    this.stringify(value).forEach(value => {
      searchParams.append(this.name, value);
    });

    return `${withPrefix ? "?" : ""}${searchParams}`;
  }
}
