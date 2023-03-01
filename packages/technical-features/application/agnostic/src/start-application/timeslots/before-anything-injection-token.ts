import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const beforeAnythingInjectionToken = getInjectionToken<Runnable>({
  id: "before-anything",
});
