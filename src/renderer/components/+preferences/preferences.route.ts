import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const preferencesRoute: RouteProps = {
  path: "/preferences"
}

export const preferencesURL = buildURL(preferencesRoute.path)
