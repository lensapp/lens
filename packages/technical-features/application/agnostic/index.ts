export { applicationFeature } from "./src/feature";

export { onLoadOfApplicationInjectionToken } from "./src/start-application/timeslots/on-load-of-application-injection-token";
export { beforeApplicationIsLoadingInjectionToken } from "./src/start-application/timeslots/before-application-is-loading-injection-token";
export { afterApplicationIsLoadedInjectionToken } from "./src/start-application/timeslots/after-application-is-loaded-injection-token";

export type { StartApplication } from "./src/start-application/start-application.injectable";
export { startApplicationInjectionToken } from "./src/start-application/start-application.injectable";

export { applicationInformationToken } from "./src/application-information-token";
export type { ApplicationInformation } from "./src/application-information-token";
