import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const ingressRoute: RouteProps = {
  path: "/ingresses"
}

export interface IngressRouteParams {
}

export const ingressURL = buildURL<IngressRouteParams>(ingressRoute.path)
