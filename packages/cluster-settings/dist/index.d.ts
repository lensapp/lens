/// <reference types="react" />
type ClusterPreferences = {
    clusterName?: string;
    icon?: string | null;
};
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
export declare const clusterIconSettingsMenuInjectionToken: import("@ogre-tools/injectable").InjectionToken<ClusterIconMenuItem, void>;
export declare const clusterIconSettingsComponentInjectionToken: import("@ogre-tools/injectable").InjectionToken<ClusterIconSettingsComponent, void>;
export {};
//# sourceMappingURL=index.d.ts.map