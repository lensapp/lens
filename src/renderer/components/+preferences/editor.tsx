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
import { Switch } from "../switch";
import { Select } from "../select";
import { SubTitle } from "../layout/sub-title";
import { SubHeader } from "../layout/sub-header";
import { Input, InputValidators } from "../input";

enum EditorLineNumbersStyles {
  on = "On",
  off = "Off",
  relative = "Relative",
  interval = "Interval",
}

export const Editor = observer(() => {
  const editorConfiguration = UserStore.getInstance().editorConfiguration;

  return (
    <section id="editor">
      <h2 data-testid="editor-configuration-header">Editor configuration</h2>

      <SubTitle title="Minimap"/>
      <section>
        <div className="flex gaps justify-space-between">
          <div className="flex gaps align-center">
            <Switch
              checked={editorConfiguration.minimap.enabled}
              onChange={() => editorConfiguration.minimap.enabled = !editorConfiguration.minimap.enabled}
            >
              Show minimap
            </Switch>
          </div>
          <div className="flex gaps align-center">
            <SubHeader compact>Position</SubHeader>
            <Select
              themeName="lens"
              options={["left", "right"]}
              value={editorConfiguration.minimap.side}
              onChange={({ value }) => editorConfiguration.minimap.side = value}
            />
          </div>
        </div>
      </section>

      <section>
        <SubTitle title="Line numbers"/>
        <Select
          options={Object.entries(EditorLineNumbersStyles).map(([value, label]) => ({ label, value }))}
          value={editorConfiguration.lineNumbers}
          onChange={({ value }) => editorConfiguration.lineNumbers = value}
          themeName="lens"
        />
      </section>

      <section>
        <SubTitle title="Tab size"/>
        <Input
          theme="round-black"
          type="number"
          min={1}
          validators={InputValidators.isNumber}
          value={editorConfiguration.tabSize.toString()}
          onChange={value => editorConfiguration.tabSize = Number(value)}
        />
      </section>
    </section>
  );
});
    
