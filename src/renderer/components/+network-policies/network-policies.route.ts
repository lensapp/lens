import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const networkPoliciesRoute: RouteProps = {
  path: "/network-policies"
}

export interface INetworkPoliciesRouteParams {
}

export const networkPoliciesURL = buildURL<INetworkPoliciesRouteParams>(networkPoliciesRoute.path);
