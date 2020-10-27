import { app } from "electron";
import { getAppVersion } from "../../common/utils";

export const version = getAppVersion()
export { isSnap, isWindows, isMac, isLinux, appName } from "../../common/vars"