import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const hpaRoute: RouteProps = {
  path: "/hpa"
}

export interface IHpaRouteParams {
}

export const hpaURL = buildURL<IHpaRouteParams>(hpaRoute.path)
