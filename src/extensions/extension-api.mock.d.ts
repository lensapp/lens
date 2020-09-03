declare module "@lens/extensions" {
  export = LensExtensions
}

declare namespace LensExtensions {
  export {
    LensExtension, ExtensionManifest, ExtensionVersion, ExtensionId, LensRendererRuntimeEnv
  } from "./extension-api"
}
