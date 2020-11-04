// Opens a link in external browser
import { shell } from "electron"

export function openExternal(url: string) {
  return shell.openExternal(url);
}
