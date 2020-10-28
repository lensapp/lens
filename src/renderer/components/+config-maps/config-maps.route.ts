import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const configMapsRoute: RouteProps = {
  path: "/configmaps"
}

export interface IConfigMapsRouteParams {
}

export const configMapsURL = buildURL<IConfigMapsRouteParams>(configMapsRoute.path);
