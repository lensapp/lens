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
import { observer } from "mobx-react";
import React from "react";
import { UserStore } from "../../../common/user-store";
import { FormSwitch, Switcher } from "../switch";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { isNumber } from "../input/input_validators";
import { Select, SelectOption } from "../select";

enum EditorLineNumbersStyles {
  on = "On",
  off = "Off",
  relative = "Relative",
  interval = "Interval",
}

export const Editor = observer(() => {
  const userStore = UserStore.getInstance();

  return (
    <section id="editor">
      <h2 data-testid="editor-configuration-header">Editor configuration</h2>
      <section>
        <FormSwitch
          control={
            <Switcher
              checked={userStore.editorConfiguration.miniMap.enabled}
              onChange={v => userStore.enableEditorMinimap(v.target.checked)}
              name="minimap"
            />
          }
          label="Show minimap"
        />
      </section>
      <section>
        <SubTitle title="Line numbers"/>
        <Select
          options={Object.entries(EditorLineNumbersStyles).map(entry => ({ label: entry[1], value: entry[0] }))}
          value={userStore.editorConfiguration?.lineNumbers}
          onChange={({ value }: SelectOption) => userStore.setEditorLineNumbers(value)}
          themeName="lens"
        />
      </section>
      <section>
        <SubTitle title="Tab size"/>
        <Input
          theme="round-black"
          min={1}
          max={10}
          validators={[isNumber]}
          value={userStore.editorConfiguration.tabSize?.toString()}
          onChange={value => {
            const n = Number(value);

            if (!isNaN(n)) {
              userStore.setEditorTabSize(n);
            }
          }}
        />
      </section>
    </section>
  );
});

