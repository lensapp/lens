/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable } from "mobx";
import type { Terminal } from "./terminal";
import type { TerminalApi } from "../../../api/terminal-api";
import type { DockTab, TabId } from "../dock/store";
import { WebSocketApiState } from "../../../api/websocket-api";
import type { CreateTerminalApi } from "../../../api/create-terminal-api.injectable";
import type { CreateTerminal } from "./create-terminal.injectable";

export interface ITerminalTab extends DockTab {
  node?: string; // activate node shell mode
}

interface Dependencies {
  createTerminal: CreateTerminal;
  createTerminalApi: CreateTerminalApi;
}

export class TerminalStore {
  protected terminals = new Map<TabId, Terminal>();
  protected connections = observable.map<TabId, TerminalApi>();

  constructor(private dependencies: Dependencies) {
  }

  @action
  connect(tab: ITerminalTab) {
    if (this.isConnected(tab.id)) {
      return;
    }
    const api = this.dependencies.createTerminalApi({
      id: tab.id,
      node: tab.node,
    });
    const terminal = this.dependencies.createTerminal(tab.id, api);

    this.connections.set(tab.id, api);
    this.terminals.set(tab.id, terminal);

    api.connect();
  }

  @action
  destroy(tabId: TabId) {
    const terminal = this.terminals.get(tabId);
    const terminalApi = this.connections.get(tabId);

    terminal?.destroy();
    terminalApi?.destroy();
    this.connections.delete(tabId);
    this.terminals.delete(tabId);
  }

  /**
   * @deprecated use `this.destroy()` instead
   */
  disconnect(tabId: TabId) {
    this.destroy(tabId);
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

  getTerminal(tabId: TabId) {
    return this.terminals.get(tabId);
  }

  getTerminalApi(tabId: TabId) {
    return this.connections.get(tabId);
  }

  reset() {
    [...this.connections].forEach(([tabId]) => {
      this.destroy(tabId);
    });
  }
}
