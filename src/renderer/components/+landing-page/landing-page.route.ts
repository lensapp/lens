import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const landingRoute: RouteProps = {
  path: "/landing"
}

export const landingURL = buildURL(landingRoute.path)
