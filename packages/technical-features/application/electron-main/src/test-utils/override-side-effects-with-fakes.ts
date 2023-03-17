import type { DiContainer } from "@ogre-tools/injectable";
import whenAppIsReadyInjectable from "../start-application/when-app-is-ready.injectable";

export const overrideSideEffectsWithFakes = (di: DiContainer) => {
  di.override(whenAppIsReadyInjectable, () => () => Promise.resolve());
};
