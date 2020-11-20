import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const podSecurityPoliciesRoute: RouteProps = {
  path: "/pod-security-policies"
}

export const podSecurityPoliciesURL = buildURL(podSecurityPoliciesRoute.path)
