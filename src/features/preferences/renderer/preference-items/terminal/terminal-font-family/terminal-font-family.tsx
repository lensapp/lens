/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Select } from "../../../../../../renderer/components/select";
import type { TerminalFontPreferencePresenter } from "./terminal-font-options.injectable";
import terminalFontPreferencePresenterInjectable from "./terminal-font-options.injectable";

interface Dependencies {
  model: TerminalFontPreferencePresenter;
}

const NonInjectedTerminalFontFamily = observer(({ model }: Dependencies) => (
  <section>
    <SubTitle title="Font family" />
    <Select
      themeName="lens"
      controlShouldRenderValue
      value={model.current.get()}
      options={model.options.get()}
      onChange={model.onSelection}
    />
  </section>
));

export const TerminalFontFamily = withInjectables<Dependencies>(NonInjectedTerminalFontFamily, {
  getProps: (di) => ({
    model: di.inject(terminalFontPreferencePresenterInjectable),
  }),
});
