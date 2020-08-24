import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const pdbRoute: RouteProps = {
  path: "/poddisruptionbudgets"
}

export interface IPodDisruptionBudgetsRouteParams {
}

export const pdbURL = buildURL<IPodDisruptionBudgetsRouteParams>(pdbRoute.path)
