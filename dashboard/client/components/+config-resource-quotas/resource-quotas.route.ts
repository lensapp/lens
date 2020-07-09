import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const resourceQuotaRoute: RouteProps = {
  path: "/resourcequotas"
};

export interface ResourceQuotaRouteParams {
}

export const resourceQuotaURL = buildURL<ResourceQuotaRouteParams>(resourceQuotaRoute.path);
