import * as fs from "fs";

export function ensureDir(dirname: string): void {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
}

export function randomFileName(name: string): string {
  return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${name}`;
}
