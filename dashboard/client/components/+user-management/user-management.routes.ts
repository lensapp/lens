import { RouteProps } from "react-router";
import { UserManagement } from "./user-management";
import { buildURL, URLParams } from "../../navigation";

export const usersManagementRoute: RouteProps = {
  get path() {
    return UserManagement.tabRoutes.map(({ path }) => path).flat();
  }
};

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

// Route params
export interface ServiceAccountsRouteParams {
}

export interface RoleBindingsRouteParams {
}

export interface RolesRouteParams {
}

// URL-builders
export const serviceAccountsURL = buildURL<ServiceAccountsRouteParams>(serviceAccountsRoute.path);
export const roleBindingsURL = buildURL<RoleBindingsRouteParams>(roleBindingsRoute.path);
export const rolesURL = buildURL<RoleBindingsRouteParams>(rolesRoute.path);
export const usersManagementURL = (params?: URLParams): string => serviceAccountsURL(params);
