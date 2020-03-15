import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const volumesRoute: RouteProps = {
  path: "/persistent-volumes"
}

export interface IVolumesRouteParams {
}

export const volumesURL = buildURL<IVolumesRouteParams>(volumesRoute.path);
