import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const afterApplicationIsLoadedInjectionToken =
  getInjectionToken<Runnable>({
    id: "after-application-is-loaded-injection-token",
  });
