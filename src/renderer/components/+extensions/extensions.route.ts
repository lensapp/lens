import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const extensionsRoute: RouteProps = {
  path: "/extensions"
}

export interface IExtensionsRouteParams {
}

export const extensionsURL = buildURL<IExtensionsRouteParams>(extensionsRoute.path);
