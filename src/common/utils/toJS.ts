// Converts mobx-observable or partially observable object to corresponding plain JS-structure.
// Since mobx >= 6.x toJS() recursively converts only top-level observables.
import * as mobx from "mobx";

export function toJS<T>(data: T): T {
  if (mobx.isObservable(data)) {
    return mobx.toJS(data); // data recursively converted, nothing to worry about.
  }

  // convert top-level plain array or object
  if (typeof data === "object" && data !== null) {
    let convertedData: any[] | T;

    if (Array.isArray(data)) {
      convertedData = data.map(toJS);
    } else {
      convertedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, toJS(value)])
      ) as T;
    }
    Object.assign(data, convertedData);
  }

  return data;
}
