// Setup static folder for common assets

import path from "path";
import { protocol } from "electron"
import logger from "../main/logger";
import { staticDir, staticProto, outDir } from "./vars";

export function registerStaticProtocol(rootFolder = staticDir) {
  const scheme = staticProto.replace("://", "");
  protocol.registerFileProtocol(scheme, (request, callback) => {
    const relativePath = request.url.replace(staticProto, "");
    const absPath = path.resolve(rootFolder, relativePath);
    callback(absPath);
  }, (error) => {
    logger.debug(`Failed to register protocol "${scheme}"`, error);
  })
}

export function getStaticUrl(filePath: string) {
  return staticProto + filePath;
}

export function getStaticPath(filePath: string) {
  return path.resolve(staticDir, filePath);
}
