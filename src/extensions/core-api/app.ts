import { getAppVersion } from "../../common/utils";
import { ExtensionsStore } from "../extensions-store";

export const version = getAppVersion();
export { isSnap, isWindows, isMac, isLinux, appName, slackUrl, issuesTrackerUrl } from "../../common/vars";

export function getEnabledExtensions(): string[] {
  return ExtensionsStore.getInstance().enabledExtensions;
}
