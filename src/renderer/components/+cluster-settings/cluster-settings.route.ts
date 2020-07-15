import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const clusterSettingsRoute: RouteProps = {
  path: "/cluster-settings"
}

export const clusterSettingsURL = buildURL(clusterSettingsRoute.path)
