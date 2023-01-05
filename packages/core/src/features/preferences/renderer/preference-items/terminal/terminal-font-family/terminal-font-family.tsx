/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
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

interface Dependencies {
  userStore: UserStore;
  logger: Logger;
}

const NonInjectedTerminalFontFamily = observer(
  ({ userStore, logger }: Dependencies) => {

    // fonts must be declared in `fonts.scss` and at `template.html` (if early-preloading required)
    const supportedCustomFonts: SelectOption<string>[] = [
      "RobotoMono", "Anonymous Pro", "IBM Plex Mono", "JetBrains Mono", "Red Hat Mono",
      "Source Code Pro", "Space Mono", "Ubuntu Mono",
    ].map(customFont => {
      const { fontFamily, fontSize } = userStore.terminalConfig;

      return {
        label: <span style={{ fontFamily: customFont, fontSize }}>{customFont}</span>,
        value: customFont,
        isSelected: fontFamily === customFont,
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
          options={supportedCustomFonts}
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
    }),
  },
);
