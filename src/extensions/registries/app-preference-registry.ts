import type React from "react"
import { BaseRegistry } from "./base-registry";

export interface AppPreferenceComponents {
  Hint: React.ComponentType<any>;
  Input: React.ComponentType<any>;
}

export interface AppPreferenceRegistration {
  title: string;
  components: AppPreferenceComponents;
}

export class AppPreferenceRegistry extends BaseRegistry<AppPreferenceRegistration> {
}

export const appPreferenceRegistry = new AppPreferenceRegistry()
