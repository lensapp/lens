import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const servicesRoute: RouteProps = {
  path: "/services"
}

export interface IServicesRouteParams {
}

export const servicesURL = buildURL<IServicesRouteParams>(servicesRoute.path);
