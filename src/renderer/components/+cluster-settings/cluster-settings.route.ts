import type { IClusterViewRouteParams } from "../cluster-manager/cluster-view.route";
import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export interface IClusterSettingsRouteParams extends IClusterViewRouteParams {
}

export const clusterSettingsRoute: RouteProps = {
  path: `/cluster/:clusterId/settings`,
}

export const clusterSettingsURL = buildURL<IClusterSettingsRouteParams>(clusterSettingsRoute.path)
