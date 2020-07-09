import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const servicesRoute: RouteProps = {
  path: "/services"
};

export interface ServicesRouteParams {
}

export const servicesURL = buildURL<ServicesRouteParams>(servicesRoute.path);
