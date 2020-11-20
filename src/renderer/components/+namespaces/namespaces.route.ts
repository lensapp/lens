import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const namespacesRoute: RouteProps = {
  path: "/namespaces"
}

export interface INamespacesRouteParams {
}

export const namespacesURL = buildURL<INamespacesRouteParams>(namespacesRoute.path)
