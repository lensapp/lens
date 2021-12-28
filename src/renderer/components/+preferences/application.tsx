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

import React from "react";
import { observer } from "mobx-react";
import { SubTitle } from "../layout/sub-title";
import { Select, SelectOption } from "../select";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";
import { Input } from "../input";
import { isWindows } from "../../../common/vars";
import { Switch } from "../switch";
import moment from "moment-timezone";
import { CONSTANTS, defaultExtensionRegistryUrl, ExtensionRegistryLocation } from "../../../common/user-store/preferences-helpers";
import { action } from "mobx";
import { isUrl } from "../input/input_validators";
import { AppPreferenceRegistry } from "../../../extensions/registries";
import { ExtensionSettings } from "./extension-settings";

const timezoneOptions: SelectOption<string>[] = moment.tz.names().map(zone => ({
  label: zone,
  value: zone,
}));
const updateChannelOptions: SelectOption<string>[] = Array.from(
  CONSTANTS.updateChannels.entries(),
  ([value, { label }]) => ({ value, label }),
);

export const Application = observer(() => {
  const userStore = UserStore.getInstance();
  const defaultShell = process.env.SHELL
    || process.env.PTYSHELL
    || (
      isWindows
        ? "powershell.exe"
        : "System default shell"
    );

  const [customUrl, setCustomUrl] = React.useState(userStore.extensionRegistryUrl.customUrl || "");
  const [shell, setShell] = React.useState(userStore.shell || "");
  const extensionSettings = AppPreferenceRegistry.getInstance().getItems().filter((preference) => preference.showInPreferencesTab === "application");

  return (
    <section id="application">
      <h2 data-testid="application-header">Application</h2>
      <section id="appearance">
        <SubTitle title="Theme"/>
        <Select
          options={ThemeStore.getInstance().themeOptions}
          value={userStore.colorTheme}
          onChange={({ value }) => userStore.colorTheme = value}
          themeName="lens"
        />
      </section>

      <hr/>

      <section id="shell">
        <SubTitle title="Terminal Shell Path"/>
        <Input
          theme="round-black"
          placeholder={defaultShell}
          value={shell}
          onChange={setShell}
          onBlur={() => userStore.shell = shell}
        />
      </section>

      <section id="terminalSelection">
        <SubTitle title="Terminal copy & paste" />
        <Switch
          checked={userStore.terminalCopyOnSelect}
          onChange={() => userStore.terminalCopyOnSelect = !userStore.terminalCopyOnSelect}
        >
          Copy on select and paste on right-click
        </Switch>
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

      <hr/>

      <section id="other">
        <SubTitle title="Start-up"/>
        <Switch checked={userStore.openAtLogin} onChange={() => userStore.openAtLogin = !userStore.openAtLogin}>
          Automatically start Lens on login
        </Switch>
      </section>

      <hr />

      {extensionSettings.map(setting => (
        <ExtensionSettings key={setting.id} setting={setting} size="normal" />
      ))}

      <section id="update-channel">
        <SubTitle title="Update Channel"/>
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
