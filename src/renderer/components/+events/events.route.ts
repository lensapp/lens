import { RouteProps } from "react-router";
import { buildURL } from "../../navigation";

export const eventRoute: RouteProps = {
  path: "/events"
}

export const eventsURL = buildURL(eventRoute.path);
