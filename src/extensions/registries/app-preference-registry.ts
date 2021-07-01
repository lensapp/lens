/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { IComputedValue } from "mobx/dist/internal";
import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface AppPreferenceComponents {
  /**
   * This will be rendered below the `<Input>` with slightly smaller font size
   *
   * @optional
   */
  Hint?: React.ComponentType<any>;

  /**
   * The component for rendering the interactive part of the setting
   */
  Input: React.ComponentType<any>;
}

export interface AppPreferenceRegistration {
  /**
   * The text that will be displayed as the title to the preference
   */
  title: string;

  /**
   * The id of your setting, used for several purposes including the navigation
   * to specific settings.
   *
   * @optional If not provided then computed from `title`
   */
  id?: string;

  /**
   * Which preferences tab to display this setting.
   *
   * @default "extensions"
   */
  showInPreferencesTab?: string;

  /**
   * A function for hiding the setting. If the function returns true then this
   * setting will not be rendered.
   *
   * @default false
   */
  hide?: boolean | IComputedValue<boolean>;

  /**
   * The components used for rendering the settings
   */
  components: AppPreferenceComponents;
}

export type RegisteredAppPreference = Required<AppPreferenceRegistration>;

export interface AppPreferenceKindRegistration {
  id: string;
  title: string;
}

/**
 * These are the default preferences kinds provided by Lens
 */
export enum AppPreferenceKind {
  Application = "application",
  Proxy = "proxy",
  Kubernetes = "kubernetes",
  Telemetry = "telemetry",
  Extensions = "extensions",
  Other = "other"
}

export class AppPreferenceRegistry extends BaseRegistry<AppPreferenceRegistration, RegisteredAppPreference> {
  getRegisteredItem({ id, showInPreferencesTab, hide = false, ...item}: AppPreferenceRegistration): RegisteredAppPreference {
    return {
      id: id || item.title.toLowerCase().replace(/[^0-9a-zA-Z]+/g, "-"),
      showInPreferencesTab: showInPreferencesTab || AppPreferenceKind.Extensions,
      hide,
      ...item,
    };
  }
}

export class AppPreferenceKindRegistry extends BaseRegistry<AppPreferenceKindRegistration> {}
