import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const welcomeRoute: RouteProps = {
  path: "/welcome"
};

export const welcomeURL = buildURL(welcomeRoute.path);
