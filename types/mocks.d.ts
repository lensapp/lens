// Black-boxed modules without type safety
declare module "electron-promise-ipc"
declare module "mac-ca"
declare module "win-ca"
declare module "@hapi/call"
declare module "@hapi/subtext"

// Support import for custom module extensions
// https://www.typescriptlang.org/docs/handbook/modules.html#wildcard-module-declarations
declare module "*.scss" {
  const content: string;
  export = content;
}
declare module "*.ttf" {
  const content: string;
  export = content;
}
