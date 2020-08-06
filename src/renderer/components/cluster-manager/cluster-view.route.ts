import { matchPath, RouteProps } from "react-router";
import { buildURL, navigation } from "../../navigation";

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
