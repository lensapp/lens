// Save file to electron app directory (e.g. "/Users/$USER/Library/Application Support/Lens" for MacOS)
import path from "path";
import { app, remote } from "electron";
import { ensureDirSync, writeFileSync, WriteFileOptions } from "fs-extra";

export function saveToAppFiles(filePath: string, contents: any, options?: WriteFileOptions): string {
  const absPath = path.resolve((app || remote.app).getPath("userData"), filePath);
  ensureDirSync(path.dirname(absPath));
  writeFileSync(absPath, contents, options);
  return absPath;
}
