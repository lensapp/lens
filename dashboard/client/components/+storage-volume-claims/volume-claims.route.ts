import { RouteProps } from "react-router"
import { buildURL } from "../../navigation";

export const volumeClaimsRoute: RouteProps = {
  path: "/persistent-volume-claims"
}

export interface IVolumeClaimsRouteParams {
}

export const volumeClaimsURL = buildURL<IVolumeClaimsRouteParams>(volumeClaimsRoute.path)
