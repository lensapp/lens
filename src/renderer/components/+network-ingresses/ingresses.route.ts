import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const ingressRoute: RouteProps = {
  path: "/ingresses"
}

export interface IngressRouteParams {
}

export const ingressURL = buildURL<IngressRouteParams>(ingressRoute.path)
