import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const hpaRoute: RouteProps = {
  path: "/hpa"
};

export interface HpaRouteParams {
}

export const hpaURL = buildURL<HpaRouteParams>(hpaRoute.path);
