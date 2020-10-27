import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const nodesRoute: RouteProps = {
  path: "/nodes"
}

export interface INodesRouteParams {
}

export const nodesURL = buildURL<INodesRouteParams>(nodesRoute.path)
