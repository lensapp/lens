import { getInjectionToken } from "@ogre-tools/injectable";

export type UntilReadyToStart = () => Promise<void>;

export const untilReadyToStartInjectionToken =
  getInjectionToken<UntilReadyToStart>({
    id: "until-ready-to-start-injection-token",
  });
