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

import { autorun, observable, when } from "mobx";
import { autoBind, noop } from "../../../utils";
import type { Terminal } from "../terminal/terminal";
import { TerminalApi, TerminalChannels } from "../../../api/terminal-api";
import {
  DockStore,
  DockTab,
  DockTabCreate,
  TabId,
  TabKind,
} from "../dock-store/dock.store";
import { WebSocketApiState } from "../../../api/websocket-api";
import { Notifications } from "../../notifications";

export interface ITerminalTab extends DockTab {
  node?: string; // activate node shell mode
}

interface Dependencies {
  createTerminalTab: () => DockTabCreate
  dockStore: DockStore
  createTerminal: (tabId: TabId, api: TerminalApi) => Terminal
}

export class TerminalStore {
  protected terminals = new Map<TabId, Terminal>();
  protected connections = observable.map<TabId, TerminalApi>();

  constructor(private dependencies: Dependencies) {
    autoBind(this);

    // connect active tab
    autorun(() => {
      const { selectedTab, isOpen } = dependencies.dockStore;

      if (selectedTab?.kind === TabKind.TERMINAL && isOpen) {
        this.connect(selectedTab.id);
      }
    });
    // disconnect closed tabs
    autorun(() => {
      const currentTabs = dependencies.dockStore.tabs.map(tab => tab.id);

      for (const [tabId] of this.connections) {
        if (!currentTabs.includes(tabId)) this.disconnect(tabId);
      }
    });
  }

  connect(tabId: TabId) {
    if (this.isConnected(tabId)) {
      return;
    }
    const tab: ITerminalTab = this.dependencies.dockStore.getTabById(tabId);
    const api = new TerminalApi({
      id: tabId,
      node: tab.node,
    });
    const terminal = this.dependencies.createTerminal(tabId, api);

    this.connections.set(tabId, api);
    this.terminals.set(tabId, terminal);

    api.connect();
  }

  disconnect(tabId: TabId) {
    if (!this.isConnected(tabId)) {
      return;
    }
    const terminal = this.terminals.get(tabId);
    const terminalApi = this.connections.get(tabId);

    terminal.destroy();
    terminalApi.destroy();
    this.connections.delete(tabId);
    this.terminals.delete(tabId);
  }

  reconnect(tabId: TabId) {
    this.connections.get(tabId)?.connect();
  }

  isConnected(tabId: TabId) {
    return Boolean(this.connections.get(tabId));
  }

  isDisconnected(tabId: TabId) {
    return this.connections.get(tabId)?.readyState === WebSocketApiState.CLOSED;
  }

  async sendCommand(command: string, options: { enter?: boolean; newTab?: boolean; tabId?: TabId } = {}) {
    const { enter, newTab, tabId } = options;

    if (tabId) {
      this.dependencies.dockStore.selectTab(tabId);
    }

    if (newTab) {
      const tab = this.dependencies.createTerminalTab();

      await when(() => this.connections.has(tab.id));

      const shellIsReady = when(() => this.connections.get(tab.id).isReady);
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
    }

    const terminalApi = this.connections.get(this.dependencies.dockStore.selectedTabId);

    if (terminalApi) {
      if (enter) {
        command += "\r";
      }

      terminalApi.sendMessage({
        type: TerminalChannels.STDIN,
        data: command,
      });
    } else {
      console.warn(
        "The selected tab is does not have a connection. Cannot send command.",
        { tabId: this.dependencies.dockStore.selectedTabId, command },
      );
    }
  }

  getTerminal(tabId: TabId) {
    return this.terminals.get(tabId);
  }

  reset() {
    [...this.connections].forEach(([tabId]) => {
      this.disconnect(tabId);
    });
  }
}
