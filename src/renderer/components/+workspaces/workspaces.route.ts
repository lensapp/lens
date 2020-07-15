import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const workspacesRoute: RouteProps = {
  path: "/workspaces"
}

export const workspacesURL = buildURL(workspacesRoute.path)
