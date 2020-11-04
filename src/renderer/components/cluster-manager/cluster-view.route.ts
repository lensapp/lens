import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export interface IClusterViewRouteParams {
  clusterId: string;
}

export const clusterViewRoute: RouteProps = {
  exact: true,
  path: "/cluster/:clusterId",
}

export const clusterViewURL = buildURL<IClusterViewRouteParams>(clusterViewRoute.path)
