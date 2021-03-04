import { RouteProps } from "react-router";
import { storageClassesRoute } from "../+storage-classes";
import { volumeClaimsRoute, volumeClaimsURL } from "../+storage-volume-claims";
import { volumesRoute } from "../+storage-volumes";
import { IURLParams } from "../../../common/utils/buildUrl";

export const storageRoute: RouteProps = {
  path: [
    volumeClaimsRoute,
    volumesRoute,
    storageClassesRoute
  ].map(route => route.path.toString())
};

export const storageURL = (params?: IURLParams) => volumeClaimsURL(params);
