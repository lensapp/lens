import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const catalogRoute: RouteProps = {
  path: "/catalog"
};

export const catalogURL = buildURL(catalogRoute.path);
