import type { RouteProps } from "react-router";
import { buildURL } from "../../../common/utils/buildUrl";

export interface EntitySettingsRouteParams {
  entityId: string;
}

export const entitySettingsRoute: RouteProps = {
  path: `/entity/:entityId/settings`,
};

export const entitySettingsURL = buildURL<EntitySettingsRouteParams>(entitySettingsRoute.path);
