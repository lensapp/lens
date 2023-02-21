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
