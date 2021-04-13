import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const limitRangesRoute: RouteProps = {
  path: "/limitranges"
};

export interface LimitRangeRouteParams {
}

export const limitRangeURL = buildURL<LimitRangeRouteParams>(limitRangesRoute.path);
