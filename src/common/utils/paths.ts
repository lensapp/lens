import path from "path";
import os from "os";

function resolveTilde(filePath: string) {
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
  }

  return filePath;
}

export function resolvePath(filePath: string): string {
  return path.resolve(resolveTilde(filePath));
}
