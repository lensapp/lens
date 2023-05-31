import { getInjectable } from "@ogre-tools/injectable";
import { execInjectable } from "./exec.injectable";
import { logSuccessInjectable } from "./log-success.injectable";
import { logWarningInjectable } from "./log-warning.injectable";

export type DoWebpackBuild = () => Promise<void>;

export const doWebpackBuildInjectable = getInjectable({
  id: "do-webpack-build",

  instantiate: (di) => {
    const exec = di.inject(execInjectable);
    const logSuccess = di.inject(logSuccessInjectable);
    const logWarning = di.inject(logWarningInjectable);

    return async () => {
      const execResult = exec("webpack");

      execResult.stdout?.on("data", logSuccess);
      execResult.stderr?.on("data", logWarning);

      return new Promise<void>((resolve) => {
        execResult.on("exit", resolve);
      });
    };
  },
});
