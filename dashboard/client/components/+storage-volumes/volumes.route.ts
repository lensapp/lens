import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const volumesRoute: RouteProps = {
  path: "/persistent-volumes"
};

export interface VolumesRouteParams {
}

export const volumesURL = buildURL<VolumesRouteParams>(volumesRoute.path);
