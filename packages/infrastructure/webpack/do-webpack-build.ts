import { getDi } from "./src/scripts/get-di";
import { doWebpackBuildInjectable } from "./src/scripts/do-webpack-build";

export const doWebpackBuild = () => {
  const di = getDi();

  const doWebpackBuild = di.inject(doWebpackBuildInjectable);

  doWebpackBuild();
};
