import { RouteProps } from "react-router";
import { appsRoute } from "../+apps/apps.route";
import { buildURL } from "../../navigation";

export const helmChartsRoute: RouteProps = {
  path: appsRoute.path + "/charts/:repo?/:chartName?"
};

export interface HelmChartsRouteParams {
  chartName?: string;
  repo?: string;
}

export const helmChartsURL = buildURL<HelmChartsRouteParams>(helmChartsRoute.path);