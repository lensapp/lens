import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const onLoadOfApplicationInjectionToken = getInjectionToken<Runnable>({
  id: "on-load-of-application",
});
