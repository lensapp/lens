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

// Manage observable URL-param from document.location.search
import type { IObservableHistory } from "mobx-observable-history";

export interface PageParamInit<V = any> {
  name: string;
  defaultValue?: V;
  defaultValueStringified?: string | string[]; // serialized version of "defaultValue"
  multiValues?: boolean; // false == by default
  multiValueSep?: string; // joining multiple values with separator, default: ","
  skipEmpty?: boolean; // skip empty value(s), e.g. "?param=", default: true
  parse?(value: string[]): V; // deserialize from URL
  stringify?(value: V): string | string[]; // serialize params to URL
}

export interface PageSystemParamInit<V = any> extends PageParamInit<V> {
  isSystem?: boolean;
}

export class PageParam<V = any> {
  static SYSTEM_PREFIX = "lens-";

  readonly name: string;
  readonly urlName: string;

  constructor(readonly init: PageParamInit<V> | PageSystemParamInit<V>, protected history: IObservableHistory) {
    const { isSystem, name } = init as PageSystemParamInit;

    this.name = name;
    this.init.skipEmpty ??= true;
    this.init.multiValueSep ??= ",";

    // prefixing to avoid collisions with extensions
    this.urlName = `${isSystem ? PageParam.SYSTEM_PREFIX : ""}${name}`;
  }

  isEmpty(value: V | any) {
    return [value].flat().every(value => value == "" || value == null);
  }

  parse(values: string[]): V {
    const { parse, multiValues } = this.init;

    if (!multiValues) values.splice(1); // reduce values to single item
    const parsedValues = [parse ? parse(values) : values].flat();

    return multiValues ? parsedValues : parsedValues[0] as any;
  }

  stringify(value: V = this.get()): string {
    const { stringify, multiValues, multiValueSep, skipEmpty } = this.init;

    if (skipEmpty && this.isEmpty(value)) {
      return "";
    }

    if (multiValues) {
      const values = [value].flat();
      const stringValues = [stringify ? stringify(value) : values.map(String)].flat();

      return stringValues.join(multiValueSep);
    }

    return [stringify ? stringify(value) : String(value)].flat()[0];
  }

  get(): V {
    const value = this.parse(this.getRaw());

    if (this.init.skipEmpty && this.isEmpty(value)) {
      return this.getDefaultValue();
    }

    return value;
  }

  set(value: V, { mergeGlobals = true, replaceHistory = false } = {}) {
    const search = this.toSearchString({ mergeGlobals, value });

    this.history.merge({ search }, replaceHistory);
  }

  setRaw(value: string | string[]) {
    const { history, urlName } = this;
    const { multiValues, multiValueSep, skipEmpty } = this.init;
    const paramValue = multiValues ? [value].flat().join(multiValueSep) : String(value);

    if (skipEmpty && this.isEmpty(paramValue)) {
      history.searchParams.delete(urlName);
    } else {
      history.searchParams.set(urlName, paramValue);
    }
  }

  getRaw(): string[] {
    const { history, urlName } = this;
    const { multiValueSep } = this.init;

    return history.searchParams.getAsArray(urlName, multiValueSep);
  }

  getDefaultValue() {
    const { defaultValue, defaultValueStringified } = this.init;

    return defaultValueStringified ? this.parse([defaultValueStringified].flat()) : defaultValue;
  }

  clear() {
    this.history.searchParams.delete(this.urlName);
  }

  toSearchString({ withPrefix = true, mergeGlobals = true, value = this.get() } = {}): string {
    const { history, urlName, init: { skipEmpty } } = this;
    const searchParams = new URLSearchParams(mergeGlobals ? history.location.search : "");

    searchParams.set(urlName, this.stringify(value));

    if (skipEmpty) {
      searchParams.forEach((value: any, paramName) => {
        if (this.isEmpty(value)) searchParams.delete(paramName);
      });
    }

    if (Array.from(searchParams).length > 0) {
      return `${withPrefix ? "?" : ""}${searchParams}`;
    }

    return "";
  }

  toObjectParam(value = this.get()): Record<string, V> {
    return {
      [this.urlName]: value,
    };
  }
}
