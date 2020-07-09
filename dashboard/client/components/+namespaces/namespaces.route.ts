import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const namespacesRoute: RouteProps = {
  path: "/namespaces"
};

export interface NamespacesRouteParams {
}

export const namespacesURL = buildURL<NamespacesRouteParams>(namespacesRoute.path);
