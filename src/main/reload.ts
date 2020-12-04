import path from "path";
import logger from "./logger";

/**
 * Use electron-reload to watch changes of main.js
 * and reload electron windows if /static/build/main.js changes
 * The dependency is not bundled to the production build.
 */
export const reload = async () => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line
    require("electron-reload")(`${process.cwd()}/static/build/main.js`, {
      electron: path.join(process.cwd(), "node_modules", ".bin", "electron"),
      hardResetMethod: "exit"
    });

    logger.info(`🔍 electron-reloadelectron-reload watching for main.js change......"`);
  }
};
