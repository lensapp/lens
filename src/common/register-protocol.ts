// Register custom protocols

import path from "path";
import { protocol } from "electron"
import logger from "../main/logger";

export function registerFileProtocol(name: string, basePath: string) {
  protocol.registerFileProtocol(name, (request, callback) => {
    const filePath = request.url.replace(name + "://", "");
    const absPath = path.resolve(basePath, filePath);
    callback(absPath);
  }, (error) => {
    if (error) {
      logger.error(`Failed to register protocol "${name}"`, { basePath, error });
    }
  })
}
