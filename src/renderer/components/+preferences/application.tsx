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
import { FormSwitch, Switcher } from "../switch";
import moment from "moment-timezone";
import { CONSTANTS } from "../../../common/user-store/preferences-helpers";

const timezoneOptions: SelectOption<string>[] = moment.tz.names().map(zone => ({
  label: zone,
  value: zone,
}));
const updateChannelOptions: SelectOption<string>[] = Array.from(
  CONSTANTS.updateChannels.entries(),
  ([value, { label }]) => ({ value, label }),
);

export const Application = observer(() => {
  const defaultShell = process.env.SHELL
    || process.env.PTYSHELL
    || (
      isWindows
        ? "powershell.exe"
        : "System default shell"
    );

  const [shell, setShell] = React.useState(UserStore.getInstance().shell || "");

  return (
    <section id="application">
      <h2 data-testid="application-header">Application</h2>
      <section id="appearance">
        <SubTitle title="Theme"/>
        <Select
          options={ThemeStore.getInstance().themeOptions}
          value={UserStore.getInstance().colorTheme}
          onChange={({ value }: SelectOption) => UserStore.getInstance().colorTheme = value}
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
          onChange={v => setShell(v)}
          onBlur={() => UserStore.getInstance().shell = shell}
        />
      </section>

      <section id="terminalSelection">
        <SubTitle title="Terminal copy & paste" />
        <FormSwitch
          label="Copy on select and paste on right-click"
          control={
            <Switcher
              checked={UserStore.getInstance().terminalCopyOnSelect}
              onChange={v => UserStore.getInstance().terminalCopyOnSelect = v.target.checked}
              name="terminalCopyOnSelect"
            />
          }
        />
      </section>

      <hr/>

      <section id="other">
        <SubTitle title="Start-up"/>
        <FormSwitch
          control={
            <Switcher
              checked={UserStore.getInstance().openAtLogin}
              onChange={v => UserStore.getInstance().openAtLogin = v.target.checked}
              name="startup"
            />
          }
          label="Automatically start Lens on login"
        />
      </section>

      <hr />

      <section id="update-channel">
        <SubTitle title="Update Channel"/>
        <Select
          options={updateChannelOptions}
          value={UserStore.getInstance().updateChannel}
          onChange={({ value }: SelectOption) => UserStore.getInstance().updateChannel = value}
          themeName="lens"
        />
      </section>

      <hr />

      <section id="locale">
        <SubTitle title="Locale Timezone" />
        <Select
          options={timezoneOptions}
          value={UserStore.getInstance().localeTimezone}
          onChange={({ value }: SelectOption) => UserStore.getInstance().setLocaleTimezone(value)}
          themeName="lens"
        />
      </section>
    </section>
  );
});
