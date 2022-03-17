/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import type { UserStore } from "../../../common/user-store";
import { Switch } from "../switch";
import { Select } from "../select";
import { SubTitle } from "../layout/sub-title";
import { SubHeader } from "../layout/sub-header";
import { Input, InputValidators } from "../input";
import { Preferences } from "./preferences";
import { withInjectables } from "@ogre-tools/injectable-react";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import { string } from "../../utils";
import { defaultEditorConfig } from "../../../common/user-store/preferences-helpers";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedEditor = observer(({ userStore }: Dependencies) => {
  const editorConfiguration = userStore.editorConfiguration;

  return (
    <Preferences data-testid="editor-preferences-page">
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
                onChange={value => editorConfiguration.minimap.side = value ?? undefined}
              />
            </div>
          </div>
        </section>

        <section>
          <SubTitle title="Line numbers"/>
          <Select
            options={[
              "on",
              "off",
              "relative",
              "interval",
            ]}
            getOptionLabel={string.uppercaseFirst}
            value={editorConfiguration.lineNumbers}
            onChange={value => editorConfiguration.lineNumbers = value ?? defaultEditorConfig.lineNumbers}
            themeName="lens"
          />
        </section>

        <section>
          <SubTitle title="Tab size" />
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
          <SubTitle title="Font size" />
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
          <SubTitle title="Font family" />
          <Input
            theme="round-black"
            type="text"
            value={editorConfiguration.fontFamily}
            onChange={value => editorConfiguration.fontFamily = value}
          />
        </section>
      </section>
    </Preferences>
  );
});

export const Editor = withInjectables<Dependencies>(
  NonInjectedEditor,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);


