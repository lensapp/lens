import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const resourceQuotaRoute: RouteProps = {
  path: "/resourcequotas"
}

export interface IResourceQuotaRouteParams {
}

export const resourceQuotaURL = buildURL<IResourceQuotaRouteParams>(resourceQuotaRoute.path);
