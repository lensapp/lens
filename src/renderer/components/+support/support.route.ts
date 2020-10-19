import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const supportRoute: RouteProps = {
  path: "/support"
}

export const supportURL = buildURL(supportRoute.path)
