import { autorun, observable } from "mobx";
import { t } from "@lingui/macro";
import { autobind } from "../../utils";
import { Terminal } from "./terminal";
import { TerminalApi } from "../../api/terminal-api";
import { dockStore, IDockTab, TabId, TabKind } from "./dock.store";
import { WebSocketApiState } from "../../api/websocket-api";
import { _i18n } from "../../i18n";

export interface ITerminalTab extends IDockTab {
  node?: string; // activate node shell mode
}

export function isTerminalTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.TERMINAL;
}

export function createTerminalTab(tabParams: Partial<ITerminalTab> = {}) {
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
      if (!isTerminalTab(selectedTab)) return;
      if (isOpen) {
        this.connect(selectedTab.id);
      }
    });
    // disconnect closed tabs
    autorun(() => {
      const currentTabs = dockStore.tabs.map(tab => tab.id);
      for (const [tabId] of this.connections) {
        if (!currentTabs.includes(tabId)) this.disconnect(tabId);
      }
    });
  }

  async connect(tabId: TabId) {
    if (this.isConnected(tabId)) {
      return;
    }
    const tab: ITerminalTab = dockStore.getTabById(tabId);
    const api = new TerminalApi({
      id: tabId,
      node: tab.node,
    });
    const terminal = new Terminal(tabId, api);
    this.connections.set(tabId, api);
    this.terminals.set(tabId, terminal);
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
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) terminalApi.connect();
  }

  isConnected(tabId: TabId) {
    return !!this.connections.get(tabId);
  }

  isDisconnected(tabId: TabId) {
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) {
      return terminalApi.readyState === WebSocketApiState.CLOSED;
    }
  }

  sendCommand(command: string, options: { enter?: boolean; newTab?: boolean; tabId?: TabId } = {}) {
    const { enter, newTab, tabId } = options;
    const { selectTab, getTabById } = dockStore;

    const tab = tabId && getTabById(tabId);
    if (tab) selectTab(tabId);
    if (newTab) createTerminalTab();

    const terminalApi = this.connections.get(dockStore.selectedTabId);
    if (terminalApi) {
      terminalApi.sendCommand(command + (enter ? "\r" : ""));
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

export const terminalStore = new TerminalStore();
