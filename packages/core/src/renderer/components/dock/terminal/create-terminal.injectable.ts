/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TerminalDependencies } from "./terminal";
import { Terminal } from "./terminal";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";
import terminalSpawningPoolInjectable from "./terminal-spawning-pool.injectable";
import terminalConfigInjectable from "../../../../common/user-store/terminal-config.injectable";
import terminalCopyOnSelectInjectable from "../../../../common/user-store/terminal-copy-on-select.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import openLinkInBrowserInjectable from "../../../../common/utils/open-link-in-browser.injectable";
import xtermColorThemeInjectable from "../../../themes/terminal-colors.injectable";

export type CreateTerminal = (tabId: TabId, api: TerminalApi) => Terminal;

const createTerminalInjectable = getInjectable({
  id: "create-terminal",
  instantiate: (di): CreateTerminal => {
    const dependencies: TerminalDependencies = {
      spawningPool: di.inject(terminalSpawningPoolInjectable),
      terminalConfig: di.inject(terminalConfigInjectable),
      terminalCopyOnSelect: di.inject(terminalCopyOnSelectInjectable),
      isMac: di.inject(isMacInjectable),
      openLinkInBrowser: di.inject(openLinkInBrowserInjectable),
      xtermColorTheme: di.inject(xtermColorThemeInjectable),
    };

    return (tabId, api) => new Terminal(dependencies, { tabId, api });
  },
});

export default createTerminalInjectable;
