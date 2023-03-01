import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const beforeApplicationIsLoadingInjectionToken =
  getInjectionToken<Runnable>({
    id: "before-application-is-loading-injection-token",
  });
