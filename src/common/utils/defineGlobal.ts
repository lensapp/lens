// Setup variable in global scope (top-level object)
// Global type definition must be added separately to `mocks.d.ts` in form:
// declare const __globalName: any;

export function defineGlobal(propName: string, descriptor: PropertyDescriptor) {
  const scope = typeof global !== "undefined" ? global : window;
  if (scope.hasOwnProperty(propName)) {
    console.info(`Global variable "${propName}" already exists. Skipping.`);
    return;
  }
  Object.defineProperty(scope, propName, descriptor);
}
