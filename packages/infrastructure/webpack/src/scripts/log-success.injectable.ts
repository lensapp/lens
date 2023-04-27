import { getInjectable } from "@ogre-tools/injectable";

export type LogSuccess = typeof console.log;

export const logSuccessInjectable = getInjectable({
  id: "log-success",
  instantiate: (di): LogSuccess => console.log,
});
