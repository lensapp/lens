import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const volumesRoute: RouteProps = {
  path: "/persistent-volumes"
}

export interface IVolumesRouteParams {
}

export const volumesURL = buildURL<IVolumesRouteParams>(volumesRoute.path);
