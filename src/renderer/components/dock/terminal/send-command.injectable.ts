/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import { waitUntilDefinied } from "../../../../common/utils/wait";
import type { TerminalApi } from "../../../api/terminal-api";
import { TerminalChannels } from "../../../api/terminal-api";
import { noop } from "../../../utils";
import { Notifications } from "../../notifications";
import selectDockTabInjectable from "../dock/select-dock-tab.injectable";
import type { DockTab, TabId } from "../dock/store";
import createTerminalTabInjectable from "./create-terminal-tab.injectable";
import getTerminalApiInjectable from "./get-terminal-api.injectable";

interface Dependencies {
  selectTab: (tabId: TabId) => void;
  createTerminalTab: () => DockTab;
  getTerminalApi: (tabId: TabId) => TerminalApi | undefined;
}

export interface SendCommandOptions {
  /**
   * Emit an enter after the command
   */
  enter?: boolean;

  /**
   * @deprecated This option is ignored and infered to be `true` if `tabId` is not provided
   */
  newTab?: any;

  /**
   * Specify a specific terminal tab to send this command to
   */
  tabId?: TabId;
}

const sendCommand = ({ selectTab, createTerminalTab, getTerminalApi }: Dependencies) => async (command: string, options: SendCommandOptions = {}): Promise<void> => {
  let tabId: string | undefined = options.tabId;

  if (tabId) {
    selectTab(tabId);
  } else {
    tabId = createTerminalTab().id;
  }

  const terminalApi = await waitUntilDefinied(() => (
    tabId
      ? getTerminalApi(tabId)
      : undefined
  ));
  const shellIsReady = when(() => terminalApi.isReady);
  const notifyVeryLong = setTimeout(() => {
    shellIsReady.cancel();
    Notifications.info(
      "If terminal shell is not ready please check your shell init files, if applicable.",
      {
        timeout: 4_000,
      },
    );
  }, 10_000);

  await shellIsReady.catch(noop);
  clearTimeout(notifyVeryLong);

  if (terminalApi) {
    if (options.enter) {
      command += "\r";
    }

    terminalApi.sendMessage({
      type: TerminalChannels.STDIN,
      data: command,
    });
  } else {
    console.warn(
      "The selected tab is does not have a connection. Cannot send command.",
      { tabId, command },
    );
  }
};

const sendCommandInjectable = getInjectable({
  id: "send-command",

  instantiate: (di) => sendCommand({
    createTerminalTab: di.inject(createTerminalTabInjectable),
    selectTab: di.inject(selectDockTabInjectable),
    getTerminalApi: di.inject(getTerminalApiInjectable),
  }),
});

export default sendCommandInjectable;
