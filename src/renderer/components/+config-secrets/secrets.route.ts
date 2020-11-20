import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const secretsRoute: RouteProps = {
  path: "/secrets"
}

export interface ISecretsRouteParams {
}

export const secretsURL = buildURL(secretsRoute.path);
