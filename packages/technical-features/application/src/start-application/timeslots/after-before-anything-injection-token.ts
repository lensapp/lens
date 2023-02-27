import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const afterBeforeAnythingInjectionToken = getInjectionToken<Runnable>({
  id: "after-before-anything",
});
