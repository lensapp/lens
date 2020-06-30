import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const nodesRoute: RouteProps = {
  path: "/nodes"
}

export interface INodesRouteParams {
}

export const nodesURL = buildURL<INodesRouteParams>(nodesRoute.path)
