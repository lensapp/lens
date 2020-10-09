import { observable } from "mobx"
import React from "react"

export interface AppPreferenceComponents {
  Hint: React.ComponentType<any>;
  Input: React.ComponentType<any>;
}

export interface AppPreferenceRegistration {
  title: string;
  components: AppPreferenceComponents;
}

export class AppPreferenceRegistry {
  preferences = observable.array<AppPreferenceRegistration>([], { deep: false });

  add(preference: AppPreferenceRegistration) {
    this.preferences.push(preference)
    return () => {
      this.preferences.replace(
        this.preferences.filter(c => c !== preference)
      )
    };
  }
}

export const appPreferenceRegistry = new AppPreferenceRegistry()
