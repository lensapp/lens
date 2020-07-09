import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const nodesRoute: RouteProps = {
  path: "/nodes"
};

export interface NodesRouteParams {
}

export const nodesURL = buildURL<NodesRouteParams>(nodesRoute.path);
