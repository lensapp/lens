import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const clusterStatusRoute: RouteProps = {
  path: "/cluster-status"
}

export const clusterStatusURL = buildURL(clusterStatusRoute.path)
