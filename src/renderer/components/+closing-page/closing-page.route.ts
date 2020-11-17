import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const closingRoute: RouteProps = {
  path: "/closing"
}

export const closingURL = buildURL(closingRoute.path)
