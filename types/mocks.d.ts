/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
declare module "mac-ca"
declare module "win-ca"
declare module "win-ca/api"
declare module "@hapi/call"
declare module "@hapi/subtext"

// Global path to static assets
declare const __static: string;

// Support import for custom module extensions
// https://www.typescriptlang.org/docs/handbook/modules.html#wildcard-module-declarations
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.scss" {
  const content: string;
  export = content;
}
declare module "*.ttf" {
  const content: string;
  export = content;
}
