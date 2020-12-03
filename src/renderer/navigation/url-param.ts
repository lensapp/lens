// Manage observable URL-param via location.search
import { IObservableHistory } from "mobx-observable-history";

export interface UrlParamInit<V = any> {
  name: string;
  isSystem?: boolean;
  defaultValue?: V;
  multiValues?: boolean; // false == by default
  multiValueSep?: string; // joining multiple values with separator, default: ","
  skipEmpty?: boolean; // skip empty value(s), e.g. "?param=", default: true
  parse?(values: string[]): V; // deserialize from URL
  stringify?(values: V): string | string[]; // serialize params to URL
}

export class UrlParam<V = any | any[]> {
  static SYSTEM_PREFIX = "lens-";

  public name: string;
  public urlName: string;

  constructor(private init: UrlParamInit<V>, private history: IObservableHistory) {
    const { isSystem, name, skipEmpty = true } = init;

    this.name = name;
    this.init.skipEmpty = skipEmpty;

    // prefixing to avoid collisions with extensions
    this.urlName = `${isSystem ? UrlParam.SYSTEM_PREFIX : ""}${name}`;
  }

  isEmpty(value: V) {
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
    const { history, urlName } = this;
    const { multiValueSep, defaultValue, skipEmpty } = this.init;
    const value = this.parse(history.searchParams.getAsArray(urlName, multiValueSep));

    if (skipEmpty && this.isEmpty(value)) {
      return defaultValue;
    }

    return value;
  }

  set(value: V, { mergeGlobals = true, replaceHistory = false } = {}) {
    const search = this.toSearchString({ mergeGlobals, value });

    this.history.merge({ search }, replaceHistory);
  }

  getDefaultValue(){
    return this.init.defaultValue;
  }

  isDefault() {
    return this.get() === this.getDefaultValue();
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
