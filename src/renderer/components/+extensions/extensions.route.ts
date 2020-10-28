import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const extensionsRoute: RouteProps = {
  path: "/extensions"
}

export const extensionsURL = buildURL(extensionsRoute.path)
