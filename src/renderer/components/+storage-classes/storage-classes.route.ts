import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const storageClassesRoute: RouteProps = {
  path: "/storage-classes"
}

export interface IStorageClassesRouteParams {
}

export const storageClassesURL = buildURL<IStorageClassesRouteParams>(storageClassesRoute.path)

