import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export const eventRoute: RouteProps = {
  path: "/events"
}

export const eventsURL = buildURL(eventRoute.path);
