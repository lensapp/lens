import { RouteProps } from "react-router";
import { UserManagement } from "./user-management"
import { buildURL, IURLParams } from "../../navigation";

export const usersManagementRoute: RouteProps = {
  get path() {
    return UserManagement.tabRoutes.map(({ path }) => path).flat()
  }
}

// Routes
export const serviceAccountsRoute: RouteProps = {
  path: "/service-accounts"
}
export const rolesRoute: RouteProps = {
  path: "/roles"
}
export const roleBindingsRoute: RouteProps = {
  path: "/role-bindings"
}

// Route params
export interface IServiceAccountsRouteParams {
}

export interface IRoleBindingsRouteParams {
}

export interface IRolesRouteParams {
}

// URL-builders
export const serviceAccountsURL = buildURL<IServiceAccountsRouteParams>(serviceAccountsRoute.path)
export const roleBindingsURL = buildURL<IRoleBindingsRouteParams>(roleBindingsRoute.path)
export const rolesURL = buildURL<IRoleBindingsRouteParams>(rolesRoute.path)
export const usersManagementURL = (params?: IURLParams) => {
  return serviceAccountsURL(params);
};
