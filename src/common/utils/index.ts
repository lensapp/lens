// Common utils (main OR renderer)

export function noop<T extends any[]>(...args: T): void {
  return void args;
}

export * from "./app-version";
export * from "./autobind";
export * from "./base64";
export * from "./camelCase";
export * from "./cloneJson";
export * from "./debouncePromise";
export * from "./defineGlobal";
export * from "./delay";
export * from "./disposer";
export * from "./disposer";
export * from "./downloadFile";
export * from "./escapeRegExp";
export * from "./extended-map";
export * from "./getRandId";
export * from "./openExternal";
export * from "./paths";
export * from "./reject-promise";
export * from "./singleton";
export * from "./splitArray";
export * from "./tar";
export * from "./toggle-set";
export * from "./type-narrowing";

import * as iter from "./iter";

export { iter };
