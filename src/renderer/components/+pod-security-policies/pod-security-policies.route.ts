import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const podSecurityPoliciesRoute: RouteProps = {
  path: "/pod-security-policies"
}

export const podSecurityPoliciesURL = buildURL(podSecurityPoliciesRoute.path)
