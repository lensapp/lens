import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const volumeClaimsRoute: RouteProps = {
  path: "/persistent-volume-claims"
};

export interface VolumeClaimsRouteParams {
}

export const volumeClaimsURL = buildURL<VolumeClaimsRouteParams>(volumeClaimsRoute.path);
