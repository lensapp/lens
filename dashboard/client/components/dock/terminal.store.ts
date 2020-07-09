import { autorun, observable } from "mobx";
import { t } from "@lingui/macro";
import { autobind } from "../../utils";
import { Terminal } from "./terminal";
import { TerminalApi } from "../../api/terminal-api";
import { dockStore, DockTabData, TabId, TabKind } from "./dock.store";
import { WebSocketApiState } from "../../api/websocket-api";
import { _i18n } from "../../i18n";
import { themeStore } from "../../theme.store";

export interface TerminalTabData extends DockTabData {
  node?: string; // activate node shell mode
}

export function isTerminalTab(tab: DockTabData): boolean {
  return tab?.kind === TabKind.TERMINAL;
}


export function createTerminalTab(tabParams: Partial<TerminalTabData> = {}): DockTabData {
  return dockStore.createTab({
    kind: TabKind.TERMINAL,
    title: _i18n._(t`Terminal`),
    ...tabParams
  });
}

@autobind()
export class TerminalStore {
  protected terminals = new Map<TabId, Terminal>();
  protected connections = observable.map<TabId, TerminalApi>();

  constructor() {
    // connect active tab
    autorun(() => {
      const { selectedTab, isOpen } = dockStore;
      if (!isTerminalTab(selectedTab)) {
        return;
      }
      if (isOpen) {
        this.connect(selectedTab.id);
      }
    });
    // disconnect closed tabs
    autorun(() => {
      const currentTabs = dockStore.tabs.map(tab => tab.id);
      for (const [tabId] of this.connections) {
        if (!currentTabs.includes(tabId)) {
          this.disconnect(tabId);
        }
      }
    });
  }

  async connect(tabId: TabId): Promise<void> {
    if (this.isConnected(tabId)) {
      return;
    }
    const tab: TerminalTabData = dockStore.getTabById(tabId);
    const api = new TerminalApi({
      id: tabId,
      node: tab.node,
      colorTheme: themeStore.activeTheme.type
    });
    const terminal = new Terminal(tabId, api);
    this.connections.set(tabId, api);
    this.terminals.set(tabId, terminal);
  }

  disconnect(tabId: TabId): void {
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

  reconnect(tabId: TabId): void {
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) {
      terminalApi.connect();
    }
  }

  isConnected(tabId: TabId): boolean {
    return !!this.connections.get(tabId);
  }

  isDisconnected(tabId: TabId): boolean {
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) {
      return terminalApi.readyState === WebSocketApiState.CLOSED;
    }
  }

  sendCommand(command: string, options: { enter?: boolean; newTab?: boolean; tabId?: TabId } = {}): void {
    const { enter, newTab, tabId } = options;
    const { selectTab, getTabById } = dockStore;

    const tab = tabId && getTabById(tabId);
    if (tab) {
      selectTab(tabId);
    }
    if (newTab) {
      createTerminalTab();
    }

    const terminalApi = this.connections.get(dockStore.selectedTabId);
    if (terminalApi) {
      terminalApi.sendCommand(command + (enter ? "\r" : ""));
    }
  }

  getTerminal(tabId: TabId): Terminal {
    return this.terminals.get(tabId);
  }

  reset(): void {
    [...this.connections].forEach(([tabId]) => {
      this.disconnect(tabId);
    });
  }
}

export const terminalStore = new TerminalStore();
