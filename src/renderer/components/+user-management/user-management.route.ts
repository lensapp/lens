/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
