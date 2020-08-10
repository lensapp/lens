import { reaction } from "mobx";
import { ipcRenderer } from "electron";
import { matchPath, RouteProps } from "react-router";
import { buildURL, navigation } from "../../navigation";
import { clusterStore, getHostedClusterId } from "../../../common/cluster-store";

export interface IClusterViewRouteParams {
  clusterId: string;
}

export const clusterViewRoute: RouteProps = {
  path: "/cluster/:clusterId"
}

export const clusterViewURL = buildURL<IClusterViewRouteParams>(clusterViewRoute.path)

export function getMatchedClusterId(): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    ...clusterViewRoute,
    exact: true,
  })
  if (matched) {
    return matched.params.clusterId;
  }
}

export function getMatchedCluster() {
  return clusterStore.getById(getMatchedClusterId())
}

// Refresh global menu depending on active route's type (common/cluster view)
if (ipcRenderer) {
  const isMainView = !getHostedClusterId();
  if (isMainView) {
    reaction(() => getMatchedClusterId(), clusterId => {
      ipcRenderer.send("menu:refresh", clusterId);
    }, {
      fireImmediately: true
    })
  }
}
