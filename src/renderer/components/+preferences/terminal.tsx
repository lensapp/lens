/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { UserStore } from "../../../common/user-store";
import { SubTitle } from "../layout/sub-title";
import { Input, InputValidators } from "../input";
import { isWindows } from "../../../common/vars";
import { Switch } from "../switch";
import { Select } from "../select";
import { ThemeStore } from "../../theme.store";

export const Terminal = observer(() => {
  const userStore = UserStore.getInstance();
  const themeStore = ThemeStore.getInstance();
  const [terminalSettings, setTerminalSettings] = React.useState({
    shell: userStore.shell || "",
    terminalFontSize: userStore.terminalConfig.fontSize,
    terminalFontFamily: userStore.terminalConfig.fontFamily,
  });
  const defaultShell = process.env.SHELL
  || process.env.PTYSHELL
  || (
    isWindows
      ? "powershell.exe"
      : "System default shell"
  );

  return (<div>
    <section id="shell">
      <SubTitle title="Terminal Shell Path"/>
      <Input
        theme="round-black"
        placeholder={defaultShell}
        value={terminalSettings.shell}
        onChange={(value) => setTerminalSettings({
          ...terminalSettings,
          shell: value,
        })}
        onBlur={() => userStore.shell = terminalSettings.shell}
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

    <section id="terminalTheme">
      <SubTitle title="Terminal theme" />
      <Select
        themeName="lens"
        options={[
          { label: "Match theme", value: "" },
          ...themeStore.themeOptions,
        ]}
        value={userStore.terminalTheme}
        onChange={({ value }) => userStore.terminalTheme = value}
      />
    </section>

    <section>
      <SubTitle title="Font size"/>
      <Input
        theme="round-black"
        type="number"
        min={10}
        validators={InputValidators.isNumber}
        value={terminalSettings.terminalFontSize.toString()}
        onChange={(value) => setTerminalSettings({
          ...terminalSettings,
          terminalFontSize: Number(value),
        })}
        onBlur={() => userStore.terminalConfig.fontSize = terminalSettings.terminalFontSize}
      />
    </section>
    <section>
      <SubTitle title="Font family"/>
      <Input
        theme="round-black"
        type="text"
        value={terminalSettings.terminalFontFamily}
        onChange={(value) => setTerminalSettings({
          ...terminalSettings,
          terminalFontFamily: value.toString(),
        })}
        onBlur={() => userStore.terminalConfig.fontFamily = terminalSettings.terminalFontFamily}
      />
    </section>
  </div>);
});
