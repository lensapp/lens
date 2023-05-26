import { getInjectable } from "@ogre-tools/injectable";

export type LogWarning = typeof console.warn;

export const logWarningInjectable = getInjectable({
  id: "log-warning",
  instantiate: (di): LogWarning => console.warn,
});
