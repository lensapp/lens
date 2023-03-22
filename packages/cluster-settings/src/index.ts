import { getInjectionToken } from "@ogre-tools/injectable";

type ClusterPreferences = {
  clusterName?: string;
  icon?: string | null;
}

export interface ClusterIconMenuItem {
  id: string;
  title: string;
  disabled?: (preferences: ClusterPreferences) => boolean;
  onClick: (preferences: ClusterPreferences) => void;
}

export interface ClusterIconSettingComponentProps {
  preferences: ClusterPreferences;
}

export interface ClusterIconSettingsComponent {
  id: string;
  Component: React.ComponentType<ClusterIconSettingComponentProps>;
}

export const clusterIconSettingsMenuInjectionToken = getInjectionToken<ClusterIconMenuItem>({
  id: "cluster-icon-settings-menu-injection-token",
});

export const clusterIconSettingsComponentInjectionToken = getInjectionToken<ClusterIconSettingsComponent>({
  id: "cluster-icon-settings-component-injection-token",
});