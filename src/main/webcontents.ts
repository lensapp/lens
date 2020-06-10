import { webContents } from "electron"
/**
 * Helper to find the correct web contents handle for main window
 */
export function findMainWebContents() {
  return webContents.getAllWebContents().find(w => w.getType() === "window");
}
