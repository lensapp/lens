import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const workspacesRoute: RouteProps = {
  path: "/workspaces"
}

export const workspacesURL = buildURL(workspacesRoute.path)
