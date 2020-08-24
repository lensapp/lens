import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const preferencesRoute: RouteProps = {
  path: "/preferences"
}

export const preferencesURL = buildURL(preferencesRoute.path)
