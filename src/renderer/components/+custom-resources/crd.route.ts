import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const crdRoute: RouteProps = {
  path: "/crd"
}

export const crdDefinitionsRoute: RouteProps = {
  path: crdRoute.path + "/definitions"
}

export const crdResourcesRoute: RouteProps = {
  path: crdRoute.path + "/:group/:name"
}

export interface ICRDListQuery {
  groups?: string;
}

export interface ICRDRouteParams {
  group: string;
  name: string;
}

export const crdURL = buildURL<{}, ICRDListQuery>(crdDefinitionsRoute.path);
export const crdResourcesURL = buildURL<ICRDRouteParams>(crdResourcesRoute.path);
