import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const appsRoute: RouteProps = {
  path: "/apps",
};

export const appsURL = buildURL(appsRoute.path);
