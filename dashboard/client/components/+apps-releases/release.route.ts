import { RouteProps } from "react-router"
import { appsRoute } from "../+apps/apps.route";
import { buildURL } from "../../navigation";

export const releaseRoute: RouteProps = {
  path: appsRoute.path + "/releases/:namespace?/:name?"
}

export interface IReleaseRouteParams {
  name?: string;
  namespace?: string;
}

export const releaseURL = buildURL<IReleaseRouteParams>(releaseRoute.path);
