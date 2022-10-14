/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, runInAction } from "mobx";
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

export interface TerminalConnection {
  terminal: Terminal;
  api: TerminalApi;
}

export interface TerminalConnectOptions {
  signal: AbortSignal;
}

export class TerminalStore {
  private readonly connections = new Map<TabId, TerminalConnection>();

  constructor(private readonly dependencies: Dependencies) {}

  connect(tab: ITerminalTab): TerminalConnection & { connectionPromise?: Promise<void> } {
    {
      const connection = this.connections.get(tab.id);

      if (connection) {
        return connection;
      }
    }

    const api = this.dependencies.createTerminalApi({
      id: tab.id,
      node: tab.node,
    });
    const terminal = this.dependencies.createTerminal(tab.id, api);

    runInAction(() => {
      this.connections.set(tab.id, { api, terminal });
    });

    const connectionPromise = api.connect();

    return { terminal, api, connectionPromise };
  }

  @action
  destroy(tabId: TabId) {
    const { terminal, api } = this.connections.get(tabId) ?? {};

    terminal?.destroy();
    api?.destroy();

    this.connections.delete(tabId);
  }

  async reconnect(tabId: TabId): Promise<void> {
    await this.connections.get(tabId)?.api.connect();
  }

  isDisconnected(tabId: TabId): boolean {
    return this.connections.get(tabId)?.api.readyState === WebSocketApiState.CLOSED;
  }

  getTerminal(tabId: TabId): Terminal | undefined {
    return this.connections.get(tabId)?.terminal;
  }

  getTerminalApi(tabId: TabId): TerminalApi | undefined {
    return this.connections.get(tabId)?.api;
  }

  reset(): void {
    [...this.connections].forEach(([tabId]) => {
      this.destroy(tabId);
    });
  }
}
