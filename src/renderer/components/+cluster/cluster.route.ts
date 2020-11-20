import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const clusterRoute: RouteProps = {
  path: "/cluster"
}

export const clusterURL = buildURL(clusterRoute.path)
