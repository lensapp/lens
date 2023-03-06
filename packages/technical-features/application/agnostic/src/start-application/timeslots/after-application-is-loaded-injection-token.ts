import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@k8slens/run-many";

export const afterApplicationIsLoadedInjectionToken =
  getInjectionToken<Runnable>({
    id: "after-application-is-loaded-injection-token",
  });
