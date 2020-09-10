import { reaction } from "mobx";
import { ipcRenderer } from "electron";
import { matchPath, RouteProps } from "react-router";
import { buildURL, navigation } from "../../navigation";
import { clusterStore } from "../../../common/cluster-store";
import { clusterSettingsRoute } from "../+cluster-settings/cluster-settings.route";

export interface IClusterViewRouteParams {
  clusterId: string;
}

export const clusterViewRoute: RouteProps = {
  exact: true,
  path: "/cluster/:clusterId",
}

export const clusterViewURL = buildURL<IClusterViewRouteParams>(clusterViewRoute.path)

export function getMatchedClusterId(): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: [
      clusterViewRoute.path,
      clusterSettingsRoute.path,
    ].flat(),
  })
  if (matched) {
    return matched.params.clusterId;
  }
}

export function getMatchedCluster() {
  return clusterStore.getById(getMatchedClusterId())
}

if (ipcRenderer) {
  if (process.isMainFrame) {
    // Keep track of active cluster-id for handling IPC/menus/etc.
    reaction(() => getMatchedClusterId(), clusterId => {
      ipcRenderer.send("cluster-view:current-id", clusterId);
    }, {
      fireImmediately: true
    })
  }

  // Reload dashboard
  ipcRenderer.on("menu:reload", () => {
    location.reload();
  });
}
