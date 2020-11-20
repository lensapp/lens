import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";
import { appsRoute } from "../+apps/apps.route";

export const releaseRoute: RouteProps = {
  path: appsRoute.path + "/releases/:namespace?/:name?"
}

export interface IReleaseRouteParams {
  name?: string;
  namespace?: string;
}

export const releaseURL = buildURL<IReleaseRouteParams>(releaseRoute.path);
