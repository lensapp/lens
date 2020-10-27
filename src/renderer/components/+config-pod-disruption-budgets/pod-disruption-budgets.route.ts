import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const pdbRoute: RouteProps = {
  path: "/poddisruptionbudgets"
}

export interface IPodDisruptionBudgetsRouteParams {
}

export const pdbURL = buildURL<IPodDisruptionBudgetsRouteParams>(pdbRoute.path)
