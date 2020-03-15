import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const configMapsRoute: RouteProps = {
  path: "/configmaps"
}

export interface IConfigMapsRouteParams {
}

export const configMapsURL = buildURL<IConfigMapsRouteParams>(configMapsRoute.path);
