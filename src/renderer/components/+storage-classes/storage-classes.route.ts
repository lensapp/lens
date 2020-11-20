import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const storageClassesRoute: RouteProps = {
  path: "/storage-classes"
}

export interface IStorageClassesRouteParams {
}

export const storageClassesURL = buildURL<IStorageClassesRouteParams>(storageClassesRoute.path)

