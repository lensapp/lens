import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const networkPoliciesRoute: RouteProps = {
  path: "/network-policies"
};

export interface NetworkPoliciesRouteParams {
}

export const networkPoliciesURL = buildURL<NetworkPoliciesRouteParams>(networkPoliciesRoute.path);
