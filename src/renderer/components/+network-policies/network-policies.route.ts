import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const networkPoliciesRoute: RouteProps = {
  path: "/network-policies"
}

export interface INetworkPoliciesRouteParams {
}

export const networkPoliciesURL = buildURL<INetworkPoliciesRouteParams>(networkPoliciesRoute.path);
