import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const volumeClaimsRoute: RouteProps = {
  path: "/persistent-volume-claims"
}

export interface IVolumeClaimsRouteParams {
}

export const volumeClaimsURL = buildURL<IVolumeClaimsRouteParams>(volumeClaimsRoute.path)
