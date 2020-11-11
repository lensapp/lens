import { ipcMain } from "electron";
import { WindowManager } from "../../main/window-manager";
import { navigate as navRenderer } from "../../renderer/navigation";
export { hideDetails, showDetails, getDetailsUrl } from "../../renderer/navigation"
export { RouteProps } from "react-router"
export { IURLParams } from "../../common/utils/buildUrl";

export async function navigate(location: string) {
  if (ipcMain) {
    await WindowManager.getInstance<WindowManager>().navigate(location)
  } else {
    navRenderer(location)
  }
}
