// todo: auto-generate from ./extension-api.ts
// todo: remove when npm-available (with generated types)

declare module "@lens/extensions" {
  export = LensExtensions
}

declare namespace LensExtensions {
  export {
    LensExtension, ExtensionManifest, ExtensionVersion, ExtensionId,
  } from "./extension-api"
}
