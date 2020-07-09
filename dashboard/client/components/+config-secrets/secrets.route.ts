import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const secretsRoute: RouteProps = {
  path: "/secrets"
};

export interface SecretsRouteParams {
}

export const secretsURL = buildURL(secretsRoute.path);
