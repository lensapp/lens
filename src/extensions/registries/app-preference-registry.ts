import type React from "react"
import { BaseRegistry, BaseRegistryItem } from "./base-registry";

export interface AppPreferenceComponents {
  Hint: React.ComponentType<any>;
  Input: React.ComponentType<any>;
}

export interface AppPreferenceRegistration extends BaseRegistryItem {
  title: string;
  components: AppPreferenceComponents;
}

export class AppPreferenceRegistry extends BaseRegistry<AppPreferenceRegistration> {
}

export const appPreferenceRegistry = new AppPreferenceRegistry()
