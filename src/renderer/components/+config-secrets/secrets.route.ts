import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const secretsRoute: RouteProps = {
  path: "/secrets"
}

export interface ISecretsRouteParams {
}

export const secretsURL = buildURL(secretsRoute.path);
