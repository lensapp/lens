import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const servicesRoute: RouteProps = {
  path: "/services"
}

export interface IServicesRouteParams {
}

export const servicesURL = buildURL<IServicesRouteParams>(servicesRoute.path);
