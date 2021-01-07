import fs from "fs";
import path from "path";

import logger from "./logger";
import { appName, publicPath } from "../common/vars";
import { webpackLensRenderer } from "../../webpack.renderer";

const rendererConfig = webpackLensRenderer({ showVars: false });
const { optimization } = rendererConfig;

const holdUntilFileExist = ({
  file, watchInterval, msg
}: {
  file: string, watchInterval: number, msg: string
}): Promise<Boolean> =>
  new Promise((resolve) => {
    const timeout = setInterval(() => {
      const fileExists = fs.existsSync(file);

      if (fileExists) {
        clearInterval(timeout);
        resolve(true);
      } else {
        logger.info(msg);
      }
    }, watchInterval);
  });

const holdUntilRendererStaticsExist = async (
  { watchInterval }: { watchInterval: number }
): Promise<void> => {
  const dir = `${__static}${publicPath}`;
  // @ts-ignore (type definition is broken in webpack-dev-server 4 beta0)
  const chuckFileName = optimization.splitChunks?.name;
  // @ts-ignore (type definition is broken in webpack-dev-server 4 beta0)
  const runtimeChuckFileName = optimization.runtimeChunk?.name;

  await Promise.all([
    `${appName}.js`, `${appName}.html`,
    `${chuckFileName}.js`, `${runtimeChuckFileName}.js`
  ].map((filename) => 
    holdUntilFileExist({
      file: path.join(dir, filename),
      watchInterval,
      msg: `waiting for ${filename}... have you compiled renderer process statics? 🤔`
    })
  ));
};

export default holdUntilFileExist;
export { holdUntilRendererStaticsExist };
