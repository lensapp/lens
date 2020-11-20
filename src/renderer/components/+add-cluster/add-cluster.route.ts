import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const addClusterRoute: RouteProps = {
  path: "/add-cluster"
}

export const addClusterURL = buildURL(addClusterRoute.path)
