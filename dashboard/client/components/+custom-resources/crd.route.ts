import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const crdRoute: RouteProps = {
  path: "/crd"
};

export const crdDefinitionsRoute: RouteProps = {
  path: crdRoute.path + "/definitions"
};

export const crdResourcesRoute: RouteProps = {
  path: crdRoute.path + "/:group/:name"
};

export interface CRDListQuery {
  groups?: string;
}

export interface CRDRouteParams {
  group: string;
  name: string;
}

export const crdURL = buildURL<{}, CRDListQuery>(crdDefinitionsRoute.path);
export const crdResourcesURL = buildURL<CRDRouteParams>(crdResourcesRoute.path);
