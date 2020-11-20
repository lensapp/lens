import type { IClusterViewRouteParams } from "../cluster-manager/cluster-view.route";
import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export interface IClusterSettingsRouteParams extends IClusterViewRouteParams {
}

export const clusterSettingsRoute: RouteProps = {
  path: `/cluster/:clusterId/settings`,
}

export const clusterSettingsURL = buildURL<IClusterSettingsRouteParams>(clusterSettingsRoute.path)
