import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const endpointRoute: RouteProps = {
  path: "/endpoints"
}

export interface EndpointRouteParams {
}

export const endpointURL = buildURL<EndpointRouteParams>(endpointRoute.path)
