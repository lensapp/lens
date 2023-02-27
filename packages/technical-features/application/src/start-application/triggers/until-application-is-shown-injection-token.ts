import { getInjectionToken } from "@ogre-tools/injectable";

export type UntilApplicationIsShown = () => Promise<void>;

export const untilApplicationIsShownInjectionToken =
  getInjectionToken<UntilApplicationIsShown>({
    id: "until-application-is-shown-injection-token",
  });
