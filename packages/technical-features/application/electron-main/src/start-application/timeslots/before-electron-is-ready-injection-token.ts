import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "@ogre-tools/injectable-utils";

export const beforeElectronIsReadyInjectionToken = getInjectionToken<Runnable>({
  id: "before-electron-is-ready-injection-token",
});
