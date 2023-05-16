import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import path from "path";

export type JoinPaths = (...args: string[]) => string;

export const joinPathsInjectionToken = getInjectionToken<JoinPaths>({
  id: "join-paths-injection-token",
});

const joinPathsInjectable = getInjectable({
  id: "join-paths",
  instantiate: (): JoinPaths => path.join,

  // This causes side effect e.g. Windows uses different separator than e.g. linux
  causesSideEffects: true,

  injectionToken: joinPathsInjectionToken,
});

export default joinPathsInjectable;
