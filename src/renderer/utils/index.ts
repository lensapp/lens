// Common usage utils & helpers

export const noop: any = Function();
export const isElectron = !!navigator.userAgent.match(/Electron/);

export * from "../../common/utils"

export * from "./cssVar"
export * from "./cssNames"
export * from "../../common/event-emitter"
export * from "./downloadFile"
export * from "./prevDefault"
export * from "./createStorage"
export * from "./interval"
export * from "./copyToClipboard"
export * from "./formatDuration"
export * from "./isReactNode"
export * from "./convertMemory"
export * from "./convertCpu"
export * from "./metricUnitsToNumber"
export * from "./display-booleans"
