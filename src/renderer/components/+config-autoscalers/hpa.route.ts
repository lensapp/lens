import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const hpaRoute: RouteProps = {
  path: "/hpa"
}

export interface IHpaRouteParams {
}

export const hpaURL = buildURL<IHpaRouteParams>(hpaRoute.path)
