import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const whatsNewRoute: RouteProps = {
  path: "/what-s-new"
}

export const whatsNewURL = buildURL(whatsNewRoute.path)
