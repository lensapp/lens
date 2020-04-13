import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const endpointRoute: RouteProps = {
  path: "/endpoints"
}

export interface EndpointRouteParams {
}

export const endpointURL = buildURL<EndpointRouteParams>(endpointRoute.path)
