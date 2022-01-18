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
import { UserStore } from "../../../common/user-store";
import { SubTitle } from "../layout/sub-title";
import { Input, InputValidators } from "../input";
import { isWindows } from "../../../common/vars";
import { Switch } from "../switch";

export const Terminal = observer(() => {
  const userStore = UserStore.getInstance();
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
