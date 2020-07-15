import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const whatsNewRoute: RouteProps = {
  path: "/what-s-new"
}

export const whatsNewURL = buildURL(whatsNewRoute.path)
