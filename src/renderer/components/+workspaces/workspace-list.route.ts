import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const workspaceListRoute: RouteProps = {
  path: `/workspaces/:workspaceName?`
};

export interface IWorkspaceListRouteParams {
  workspaceName?: string;
}

export const workspaceListURL = buildURL<IWorkspaceListRouteParams>(workspaceListRoute.path);