import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const landingRoute: RouteProps = {
  path: "/landing"
}

export const landingURL = buildURL(landingRoute.path)
