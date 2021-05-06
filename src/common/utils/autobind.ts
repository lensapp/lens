// Automatically bind methods to their class instance
// API: https://github.com/sindresorhus/auto-bind
import autoBindClass, { Options } from "auto-bind";
import autoBindReactClass from "auto-bind/react";

export function autoBind<T extends object>(obj: T, opts?: Options): T {
  if ("componentWillUnmount" in obj) {
    return autoBindReactClass(obj as any, opts);
  }

  return autoBindClass(obj, opts);
}

export function autobind(): any {
  return (): void => undefined; // noop
}
