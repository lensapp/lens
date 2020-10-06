// Lens-extensions api developer's kit
// TODO: add more common re-usable UI components + refactor interfaces (Props -> ComponentProps)

// TODO: figure out how to import as normal npm-package
export { default as React } from "react"

export * from "./lens-extension"
export { LensRuntimeRendererEnv } from "./lens-runtime";
export { DynamicPageType } from "./register-page";

export * from "../renderer/components/icon"
export * from "../renderer/components/tooltip"
export * from "../renderer/components/button"
export * from "../renderer/components/tabs"
export * from "../renderer/components/badge"
