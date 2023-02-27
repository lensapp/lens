export { feature } from "./src/feature";

export { onLoadOfApplicationInjectionToken } from "./src/start-application/timeslots/on-load-of-application-injection-token";
export { beforeApplicationIsLoadingInjectionToken } from "./src/start-application/timeslots/before-application-is-loading-injection-token";
export { beforeAnythingInjectionToken } from "./src/start-application/timeslots/before-anything-injection-token";

export { afterBeforeAnythingInjectionToken } from "./src/start-application/timeslots/after-before-anything-injection-token";
export { afterApplicationIsLoadedInjectionToken } from "./src/start-application/timeslots/after-application-is-loaded-injection-token";

export { untilReadyToStartInjectionToken } from "./src/start-application/triggers/until-ready-to-start-injection-token";
export type { UntilReadyToStart } from "./src/start-application/triggers/until-ready-to-start-injection-token";

export { untilApplicationIsShownInjectionToken } from "./src/start-application/triggers/until-application-is-shown-injection-token";
export type { UntilApplicationIsShown } from "./src/start-application/triggers/until-application-is-shown-injection-token";

export { untilApplicationIsReadyToLoadInjectionToken } from "./src/start-application/triggers/until-application-is-ready-to-load-injection-token";
export type { UntilApplicationIsReadyToLoad } from "./src/start-application/triggers/until-application-is-ready-to-load-injection-token";

export type { StartApplication } from "./src/start-application/start-application.injectable";
export { startApplicationInjectionToken } from "./src/start-application/start-application.injectable";

export { applicationInformationToken } from "./src/application-information-token";
export type { ApplicationInformation } from "./src/application-information-token";
