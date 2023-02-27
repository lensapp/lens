import { getInjectionToken } from "@ogre-tools/injectable";

export type UntilApplicationIsReadyToLoad = () => Promise<void>;

export const untilApplicationIsReadyToLoadInjectionToken =
  getInjectionToken<UntilApplicationIsReadyToLoad>({
    id: "until-application-is-ready-to-load-injection-token",
  });
