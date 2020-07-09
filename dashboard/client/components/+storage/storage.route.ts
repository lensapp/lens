import { RouteProps } from "react-router";
import { volumeClaimsURL } from "../+storage-volume-claims";
import { Storage } from "./storage";
import { URLParams } from "../../navigation";

export const storageRoute: RouteProps = {
  get path() {
    return Storage.tabRoutes.map(({ path }) => path).flat();
  }
};

export const storageURL = (params?: URLParams): string => volumeClaimsURL(params);
