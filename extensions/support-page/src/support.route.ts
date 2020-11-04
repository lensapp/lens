import type { RouteProps } from "react-router";

export const supportPageRoute: RouteProps = {
  path: "/support"
}

export const supportPageURL = () => supportPageRoute.path.toString();
