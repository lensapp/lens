/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterPreferences } from "../../../common/cluster-types";

export type ChangedClusterPreference = [keyof ClusterPreferences, any];

export interface ClusterIconMenuItem {
  id: string;
  title: string;
  disabled?: (preferences: ClusterPreferences) => boolean;
  onClick: (preferences: ClusterPreferences) => ChangedClusterPreference;
}

export const clusterIconSettingsMenuInjectionToken = getInjectionToken<ClusterIconMenuItem>({
  id: "cluster-icon-settings-menu-injection-token",
});
