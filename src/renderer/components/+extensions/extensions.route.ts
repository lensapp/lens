import { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const extensionsRoute: RouteProps = {
  path: "/extensions"
}

export const extensionsURL = buildURL(extensionsRoute.path)
