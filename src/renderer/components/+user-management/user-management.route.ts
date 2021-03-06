import type { RouteProps } from "react-router";
import { buildURL, IURLParams } from "../../../common/utils/buildUrl";

// Routes
export const serviceAccountsRoute: RouteProps = {
  path: "/service-accounts"
};
export const rolesRoute: RouteProps = {
  path: "/roles"
};
export const roleBindingsRoute: RouteProps = {
  path: "/role-bindings"
};
export const podSecurityPoliciesRoute: RouteProps = {
  path: "/pod-security-policies"
};

export const usersManagementRoute: RouteProps = {
  path: [
    serviceAccountsRoute,
    roleBindingsRoute,
    rolesRoute,
    podSecurityPoliciesRoute
  ].map(route => route.path.toString())
};

// Route params
export interface IServiceAccountsRouteParams {
}

export interface IRoleBindingsRouteParams {
}

export interface IRolesRouteParams {
}

// URL-builders
export const usersManagementURL = (params?: IURLParams) => serviceAccountsURL(params);
export const serviceAccountsURL = buildURL<IServiceAccountsRouteParams>(serviceAccountsRoute.path);
export const roleBindingsURL = buildURL<IRoleBindingsRouteParams>(roleBindingsRoute.path);
export const rolesURL = buildURL<IRoleBindingsRouteParams>(rolesRoute.path);
export const podSecurityPoliciesURL = buildURL(podSecurityPoliciesRoute.path);
