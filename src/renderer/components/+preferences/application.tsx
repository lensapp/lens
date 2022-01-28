/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { SubTitle } from "../layout/sub-title";
import { Select, SelectOption } from "../select";
import type { ThemeStore } from "../../themes/store";
import type { UserPreferencesStore } from "../../../common/user-preferences";
import { Input } from "../input";
import { Switch } from "../switch";
import moment from "moment-timezone";
import { CONSTANTS, defaultExtensionRegistryUrl, ExtensionRegistryLocation } from "../../../common/user-preferences/preferences-helpers";
import { action, IComputedValue } from "mobx";
import { isUrl } from "../input/input_validators";
import { ExtensionSettings } from "./extension-settings";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import { withInjectables } from "@ogre-tools/injectable-react";
import appPreferencesInjectable from "./app-preferences/app-preferences.injectable";
import themeStoreInjectable from "../../themes/store.injectable";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";

const timezoneOptions: SelectOption<string>[] = moment.tz.names().map(zone => ({
  label: zone,
  value: zone,
}));
const updateChannelOptions: SelectOption<string>[] = Array.from(
  CONSTANTS.updateChannels.entries(),
  ([value, { label }]) => ({ value, label }),
);

export interface ApplicationProps {}

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
  userStore: UserPreferencesStore;
  themeStore: ThemeStore;
}

const NonInjectedApplication = observer(({ appPreferenceItems, themeStore, userStore }: Dependencies & ApplicationProps) => {
  const [customUrl, setCustomUrl] = React.useState(userStore.extensionRegistryUrl.customUrl || "");
  const extensionSettings = appPreferenceItems.get().filter((preference) => preference.showInPreferencesTab === "application");

  return (
    <section id="application">
      <h2 data-testid="application-header">Application</h2>
      <section id="appearance">
        <SubTitle title="Theme" />
        <Select
          options={themeStore.themeOptions}
          value={userStore.colorTheme}
          onChange={({ value }) => userStore.colorTheme = value}
          themeName="lens"
        />
      </section>

      <hr/>

      <section id="extensionRegistryUrl">
        <SubTitle title="Extension Install Registry" />
        <Select
          options={Object.values(ExtensionRegistryLocation)}
          value={userStore.extensionRegistryUrl.location}
          onChange={action(({ value }) => {
            userStore.extensionRegistryUrl.location = value;

            if (userStore.extensionRegistryUrl.location === ExtensionRegistryLocation.CUSTOM) {
              userStore.extensionRegistryUrl.customUrl = "";
            }
          })}
          themeName="lens"
        />
        <p className="mt-4 mb-5 leading-relaxed">
          This setting is to change the registry URL for installing extensions by name.{" "}
          If you are unable to access the default registry ({defaultExtensionRegistryUrl}){" "}
          you can change it in your <b>.npmrc</b>&nbsp;file or in the input below.
        </p>

        <Input
          theme="round-black"
          validators={isUrl}
          value={customUrl}
          onChange={setCustomUrl}
          onBlur={() => userStore.extensionRegistryUrl.customUrl = customUrl}
          placeholder="Custom Extension Registry URL..."
          disabled={userStore.extensionRegistryUrl.location !== ExtensionRegistryLocation.CUSTOM}
        />
      </section>

      <hr />

      <section id="other">
        <SubTitle title="Start-up" />
        <Switch checked={userStore.openAtLogin} onChange={() => userStore.openAtLogin = !userStore.openAtLogin}>
          Automatically start Lens on login
        </Switch>
      </section>

      <hr />

      {extensionSettings.map(setting => (
        <ExtensionSettings key={setting.id} setting={setting} size="normal" />
      ))}

      <section id="update-channel">
        <SubTitle title="Update Channel" />
        <Select
          options={updateChannelOptions}
          value={userStore.updateChannel}
          onChange={({ value }) => userStore.updateChannel = value}
          themeName="lens"
        />
      </section>

      <hr />

      <section id="locale">
        <SubTitle title="Locale Timezone" />
        <Select
          options={timezoneOptions}
          value={userStore.localeTimezone}
          onChange={({ value }) => userStore.setLocaleTimezone(value)}
          themeName="lens"
        />
      </section>
    </section>
  );
});

export const Application = withInjectables<Dependencies, ApplicationProps>(NonInjectedApplication, {
  getProps: (di) => ({
    appPreferenceItems: di.inject(appPreferencesInjectable),
    themeStore: di.inject(themeStoreInjectable),
    userStore: di.inject(userPreferencesStoreInjectable),
  }),
});
