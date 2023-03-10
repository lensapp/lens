import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@k8slens/run-many";

export const beforeApplicationIsLoadingInjectionToken = getInjectionToken<Runnable>({
  id: "before-application-is-loading-injection-token",
});

export const onLoadOfApplicationInjectionToken = getInjectionToken<Runnable>({
  id: "on-load-of-application",
});

export const afterApplicationIsLoadedInjectionToken = getInjectionToken<Runnable>({
  id: "after-application-is-loaded-injection-token",
});
