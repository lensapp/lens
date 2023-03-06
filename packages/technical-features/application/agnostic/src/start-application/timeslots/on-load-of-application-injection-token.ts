import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@k8slens/run-many";

export const onLoadOfApplicationInjectionToken = getInjectionToken<Runnable>({
  id: "on-load-of-application",
});
