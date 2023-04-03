/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed } from "mobx";
import React from "react";
import type { SingleValue } from "react-select";
import { defaultTerminalFontFamily } from "../../../../../../common/vars";
import type { SelectOption } from "../../../../../../renderer/components/select";
import { terminalFontInjectionToken } from "../../../../../terminal/renderer/fonts/token";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

export interface TerminalFontPreferencePresenter {
  readonly options: IComputedValue<SelectOption<string>[]>;
  readonly current: IComputedValue<string>;
  onSelection: (selection: SingleValue<SelectOption<string>>) => void;
}

const terminalFontPreferencePresenterInjectable = getInjectable({
  id: "terminal-font-preference-presenter",
  instantiate: (di): TerminalFontPreferencePresenter => {
    const state = di.inject(userPreferencesStateInjectable);
    const terminalFonts = di.injectMany(terminalFontInjectionToken);

    return {
      options: computed(() => terminalFonts.map(font => ({
        label: (
          <span
            style={{
              fontFamily: `${font.name}, var(--font-terminal)`,
              fontSize: state.terminalConfig.fontSize,
            }}
          >
            {font.name}
          </span>
        ),
        value: font.name,
        isSelected: state.terminalConfig.fontFamily === font.name,
      }))),
      current: computed(() => state.terminalConfig.fontFamily),
      onSelection: action(selection => {
        state.terminalConfig.fontFamily = selection?.value ?? defaultTerminalFontFamily;
      }),
    };
  },
});

export default terminalFontPreferencePresenterInjectable;
