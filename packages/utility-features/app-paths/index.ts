import { appPathsFeature } from "./src/feature";

export type { JoinPaths } from "./src/join-paths/join-paths.injectable";
export { joinPathsInjectionToken } from "./src/join-paths/join-paths.injectable";

export { appPathsInjectionToken, pathNames } from "./src/app-paths-injection-token";

export type { AppPaths, PathName } from "./src/app-paths-injection-token";

export { testUtils } from "./src/test-utils";

export default appPathsFeature;
