import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const addClusterRoute: RouteProps = {
  path: "/add-cluster"
}

export const addClusterURL = buildURL(addClusterRoute.path)
