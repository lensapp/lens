// Converts mobx-observable or partially observable object to corresponding plain JS-structure.
// Since mobx >= 6.x toJS() recursively converts only top-level observables.
import * as mobx from "mobx";
import { isObservable, observable } from "mobx";

export function toJS<T>(data: T): T {
  if (isObservable(data)) {
    return mobx.toJS(data);
  }

  // make data observable for recursive toJS()-call
  return mobx.toJS(observable.box(data).get());
}
