// Load & parse local kubernetes config (dev-only)

import * as jsYaml from "js-yaml"
import * as fs from "fs"
import * as os from "os"
import chalk from "chalk";
import { logger } from "./logger";

interface IKubeConfigParams {
  clusterUrl: string;
  userToken: string;
}

export function getKubeConfigDev(): Partial<IKubeConfigParams> {
  const KUBE_CONFIG_FILE = process.env.KUBE_CONFIG_FILE;
  if (!KUBE_CONFIG_FILE) {
    return {}
  }
  let filePath = ""
  try {
    filePath = KUBE_CONFIG_FILE.replace("~", os.homedir());
    const yaml = fs.readFileSync(filePath).toString();
    const config = jsYaml.safeLoad(yaml);
    return {
      clusterUrl: config.clusters[0].cluster.server,
      userToken: config.users[0].user.token,
    }
  } catch (err) {
    logger.error(`[KUBE-CONFIG] Parsing config file ${chalk.bold(filePath)} failed.`, err)
    return {};
  }
}
