import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const resourceQuotaRoute: RouteProps = {
  path: "/resourcequotas"
}

export interface IResourceQuotaRouteParams {
}

export const resourceQuotaURL = buildURL<IResourceQuotaRouteParams>(resourceQuotaRoute.path);
