import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const appsRoute: RouteProps = {
  path: "/apps",
};

export const appsURL = buildURL(appsRoute.path);
