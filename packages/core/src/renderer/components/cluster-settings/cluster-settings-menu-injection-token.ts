import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterPreferences } from "../../../common/cluster-types";

export type ChangedClusterPreference = [keyof ClusterPreferences, any];

export type ClusterIconMenuItem = {
  id: string,
  title: string,
  disabled: (preferences: ClusterPreferences) => boolean,
  onClick: (preferences: ClusterPreferences) => ChangedClusterPreference,
}

export const clusterIconSettingsMenuInjectionToken = getInjectionToken<ClusterIconMenuItem>({
  id: "cluster-icon-settings-menu-injection-token",
});