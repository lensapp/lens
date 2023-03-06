import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@k8slens/run-many";

export const beforeAnythingInjectionToken = getInjectionToken<Runnable>({
  id: "before-anything",
});
