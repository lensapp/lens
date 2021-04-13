import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface AppPreferenceComponents {
  Hint: React.ComponentType<any>;
  Input: React.ComponentType<any>;
}

export interface AppPreferenceRegistration {
  title: string;
  id?: string;
  showInPreferencesTab?: string;
  components: AppPreferenceComponents;
}

export interface RegisteredAppPreference extends AppPreferenceRegistration {
  id: string;
}

export class AppPreferenceRegistry extends BaseRegistry<AppPreferenceRegistration, RegisteredAppPreference> {
  getRegisteredItem(item: AppPreferenceRegistration): RegisteredAppPreference {
    return {
      id: item.id || item.title.toLowerCase().replace(/[^0-9a-zA-Z]+/g, "-"),
      ...item,
    };
  }
}

export const appPreferenceRegistry = new AppPreferenceRegistry();
