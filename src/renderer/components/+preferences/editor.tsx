/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
      <section>
        <SubTitle title="Font size"/>
        <Input
          theme="round-black"
          type="number"
          min={10}
          validators={InputValidators.isNumber}
          value={editorConfiguration.fontSize.toString()}
          onChange={value => editorConfiguration.fontSize = Number(value)}
        />
      </section>
      <section>
        <SubTitle title="Font family"/>
        <Input
          theme="round-black"
          type="text"
          value={editorConfiguration.fontFamily}
          onChange={value => editorConfiguration.fontFamily = value}
        />
      </section>
    </section>
  );
});

