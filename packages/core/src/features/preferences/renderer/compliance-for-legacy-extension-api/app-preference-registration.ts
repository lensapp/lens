/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";

export interface AppPreferenceComponents {
  Hint: React.ComponentType<Record<string, never>>;
  Input: React.ComponentType<Record<string, never>>;
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

