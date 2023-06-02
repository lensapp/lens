import { getInjectable } from "@ogre-tools/injectable";
import { execInjectable } from "./exec.injectable";
import { logSuccessInjectable } from "./log-success.injectable";
import { logWarningInjectable } from "./log-warning.injectable";

export type DoWebpackBuildResult = { statusCode: number };

export type DoWebpackBuild = ({
  watch,
}: {
  watch: boolean;
}) => Promise<DoWebpackBuildResult>;

export const doWebpackBuildInjectable = getInjectable({
  id: "do-webpack-build",

  instantiate: (di): DoWebpackBuild => {
    const exec = di.inject(execInjectable);
    const logSuccess = di.inject(logSuccessInjectable);
    const logWarning = di.inject(logWarningInjectable);

    return async ({ watch }) => {
      const execResult = exec(watch ? "webpack --watch" : "webpack");

      execResult.stdout?.on("data", logSuccess);
      execResult.stderr?.on("data", logWarning);

      return new Promise<DoWebpackBuildResult>((resolve) => {
        execResult.on("exit", (statusCode: number) => {
          resolve({ statusCode });
        });
      });
    };
  },
});
