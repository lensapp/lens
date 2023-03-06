import { overrideSideEffectsWithFakes } from "./src/override-side-effects-with-fakes";

export { beforeElectronIsReadyInjectionToken } from "./src/start-application/timeslots/before-electron-is-ready-injection-token";
export { beforeAnythingInjectionToken } from "./src/start-application/timeslots/before-anything-injection-token";

export { applicationFeatureForElectronMain } from "./src/feature";

export const testUtils = { overrideSideEffectsWithFakes }
