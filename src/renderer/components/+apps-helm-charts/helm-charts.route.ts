import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";
import { appsRoute } from "../+apps/apps.route";

export const helmChartsRoute: RouteProps = {
  path: appsRoute.path + "/charts/:repo?/:chartName?"
}

export interface IHelmChartsRouteParams {
  chartName?: string;
  repo?: string;
}

export const helmChartsURL = buildURL<IHelmChartsRouteParams>(helmChartsRoute.path)