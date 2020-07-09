import { webContents, WebContents } from "electron";
/**
 * Helper to find the correct web contents handle for main window
 */
export function findMainWebContents(): WebContents {
  return webContents.getAllWebContents().find(w => w.getType() === "window");
}
