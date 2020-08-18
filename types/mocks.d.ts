// Black-boxed modules without type safety
declare module "mac-ca"
declare module "win-ca"
declare module "@hapi/call"
declare module "@hapi/subtext"

// Global path to static assets
declare const __static: string;

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
