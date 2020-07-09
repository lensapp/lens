import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const configMapsRoute: RouteProps = {
  path: "/configmaps"
};

export interface ConfigMapsRouteParams {
}

export const configMapsURL = buildURL<ConfigMapsRouteParams>(configMapsRoute.path);
