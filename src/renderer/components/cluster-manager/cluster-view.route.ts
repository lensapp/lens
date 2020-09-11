import { reaction } from "mobx";
import { ipcRenderer } from "electron";
import { matchPath, RouteProps } from "react-router";
import { buildURL, navigation } from "../../navigation";
import { clusterStore, getHostedClusterId } from "../../../common/cluster-store";

export interface IClusterViewRouteParams {
  clusterId: string;
}

export const clusterViewRoute: RouteProps = {
  exact: true,
  path: "/cluster/:clusterId",
}

export const clusterViewURL = buildURL<IClusterViewRouteParams>(clusterViewRoute.path)

export function getMatchedClusterId(extraRoutes: RouteProps[] = []): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: [
      clusterViewRoute.path,
      ...extraRoutes.map(route => route.path)
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
  // Refresh global menu depending on active route's type (common/cluster view)
  const isMainView = !getHostedClusterId();
  if (isMainView) {
    reaction(() => getMatchedClusterId(), clusterId => {
      ipcRenderer.send("cluster-view:change", clusterId);
    }, {
      fireImmediately: true
    })
  }

  // Reload dashboard
  ipcRenderer.on("menu:reload", () => {
    location.reload();
  });
}
