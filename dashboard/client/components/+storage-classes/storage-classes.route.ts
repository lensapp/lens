import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const storageClassesRoute: RouteProps = {
  path: "/storage-classes"
};

export interface StorageClassesRouteParams {
}

export const storageClassesURL = buildURL<StorageClassesRouteParams>(storageClassesRoute.path);

