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

    const execWithResultHandling = async (command: string) => {
      const { stdout, stderr } = await exec(command);

      if (stderr) {
        logWarning(`Warning while executing "${command}": ${stderr}`);
      } else if (stdout) {
        logSuccess(stdout);
      }
    };

    return async () => {
      await execWithResultHandling("webpack");

      await execWithResultHandling("linkable-push");
    };
  },
});
