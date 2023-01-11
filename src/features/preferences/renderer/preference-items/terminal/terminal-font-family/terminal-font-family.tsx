/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useEffect } from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import type { SelectOption } from "../../../../../../renderer/components/select";
import { Select } from "../../../../../../renderer/components/select";
import type { Logger } from "../../../../../../common/logger";
import { action } from "mobx";
import loggerInjectable from "../../../../../../common/logger.injectable";
import {
  preloadAllTerminalFontsInjectable,
  terminalFontsInjectable,
} from "../../../../../../renderer/components/dock/terminal/terminal-fonts.injectable";

interface Dependencies {
  userStore: UserStore;
  logger: Logger;
  terminalFonts: Map<string, string>;
  preloadFonts: () => Promise<void>;
}

const NonInjectedTerminalFontFamily = observer(
  ({ userStore, logger, terminalFonts, preloadFonts }: Dependencies) => {
    useEffect(() => {
      preloadFonts(); // preload all fonts to show preview in select-box
    }, []);

    const bundledFonts: SelectOption<string>[] = Array.from(terminalFonts.keys()).map(font => {
      const { fontFamily, fontSize } = userStore.terminalConfig;

      return {
        label: (
          <span style={{ fontFamily: `${font}, var(--font-terminal)`, fontSize }}>
            {font}
          </span>
        ),
        value: font,
        isSelected: fontFamily === font,
      };
    });

    const onFontFamilyChange = action(({ value: fontFamily }: SelectOption<string>) => {
      logger.info(`setting terminal font to ${fontFamily}`);

      userStore.terminalConfig.fontFamily = fontFamily; // save to external storage
    });


    return (
      <section>
        <SubTitle title="Font family" />
        <Select
          themeName="lens"
          controlShouldRenderValue
          value={userStore.terminalConfig.fontFamily}
          options={bundledFonts}
          onChange={onFontFamilyChange as any}
        />
      </section>
    );
  },
);

export const TerminalFontFamily = withInjectables<Dependencies>(
  NonInjectedTerminalFontFamily,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
      logger: di.inject(loggerInjectable),
      terminalFonts: di.inject(terminalFontsInjectable),
      preloadFonts: di.inject(preloadAllTerminalFontsInjectable),
    }),
  },
);
