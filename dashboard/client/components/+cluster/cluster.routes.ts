import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const clusterRoute: RouteProps = {
  path: "/cluster"
}

export const clusterURL = buildURL(clusterRoute.path)
