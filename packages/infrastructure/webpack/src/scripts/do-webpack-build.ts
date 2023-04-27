import { getInjectable } from "@ogre-tools/injectable";
import { execInjectable } from "./exec.injectable";
import { logSuccessInjectable } from "./log-success.injectable";

export type DoWebpackBuild = () => Promise<void>;

export const doWebpackBuildInjectable = getInjectable({
  id: "do-webpack-build",

  instantiate: (di) => {
    const exec = di.inject(execInjectable);
    const logSuccess = di.inject(logSuccessInjectable);

    return async () => {
      const { stdout, stderr } = await exec("webpack");

      if (stderr) {
        throw new Error(stderr);
      }

      logSuccess(stdout);
    };
  },
});
