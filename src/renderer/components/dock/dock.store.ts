import MD5 from "crypto-js/md5";
import { action, computed, IReactionOptions, observable, reaction } from "mobx";
import { autobind, createStorage } from "../../utils";
import throttle from "lodash/throttle"

export type TabId = string;

export enum TabKind {
  TERMINAL = "terminal",
  CREATE_RESOURCE = "create-resource",
  EDIT_RESOURCE = "edit-resource",
  INSTALL_CHART = "install-chart",
  UPGRADE_CHART = "upgrade-chart",
  POD_LOGS = "pod-logs",
}

export interface IDockTab {
  id?: TabId;
  kind: TabKind;
  title?: string;
  pinned?: boolean; // not closable
}

@autobind()
export class DockStore {
  protected initialTabs: IDockTab[] = [
    { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal" },
  ];

  protected storage = createStorage("dock", {}); // keep settings in localStorage
  public readonly defaultTabId = this.initialTabs[0].id;
  public readonly minHeight = 100;

  @observable isOpen = false;
  @observable fullSize = false;
  @observable height = this.defaultHeight;
  @observable tabs = observable.array<IDockTab>(this.initialTabs);
  @observable selectedTabId = this.defaultTabId;

  @computed get selectedTab() {
    return this.tabs.find(tab => tab.id === this.selectedTabId);
  }

  get defaultHeight() {
    return Math.round(window.innerHeight / 2.5);
  }

  get maxHeight() {
    const mainLayoutHeader = 40
    const mainLayoutTabs = 33
    const mainLayoutMargin = 16
    const dockTabs = 33
    const preferedMax = window.innerHeight - mainLayoutHeader - mainLayoutTabs - mainLayoutMargin - dockTabs
    return Math.max(preferedMax, this.minHeight) // don't let max < min
  }

  constructor() {
    Object.assign(this, this.storage.get());

    reaction(() => ({
      isOpen: this.isOpen,
      selectedTabId: this.selectedTabId,
      height: this.height,
      tabs: this.tabs.slice(),
    }), data => {
      this.storage.set(data);
    });

    // adjust terminal height if window size changes
    window.addEventListener("resize", throttle(this.checkMaxHeight, 250));
  }

  protected checkMaxHeight() {
    if (!this.height) {
      this.setHeight(this.defaultHeight || this.minHeight);
    }
    if (this.height > this.maxHeight) {
      this.setHeight(this.maxHeight);
    }
  }

  onResize(callback: () => void, options?: IReactionOptions) {
    return reaction(() => [this.height, this.fullSize], callback, options);
  }

  onTabChange(callback: (tabId: TabId) => void, options?: IReactionOptions) {
    return reaction(() => this.selectedTabId, callback, options);
  }

  hasTabs() {
    return this.tabs.length > 0;
  }

  @action
  open(fullSize?: boolean) {
    this.isOpen = true;
    if (typeof fullSize === "boolean") {
      this.fullSize = fullSize;
    }
  }

  @action
  close() {
    this.isOpen = false;
  }

  @action
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  @action
  toggleFillSize() {
    if (!this.isOpen) this.open();
    this.fullSize = !this.fullSize;
  }

  getTabById(tabId: TabId) {
    return this.tabs.find(tab => tab.id === tabId);
  }

  protected getNewTabNumber(kind: TabKind) {
    const tabNumbers = this.tabs
      .filter(tab => tab.kind === kind)
      .map(tab => {
        const tabNumber = +tab.title.match(/\d+/);
        return tabNumber === 0 ? 1 : tabNumber; // tab without a number is first
      });
    for (let i = 1; ; i++) {
      if (!tabNumbers.includes(i)) return i;
    }
  }

  @action
  createTab(anonTab: IDockTab, addNumber = true): IDockTab {
    const tabId = MD5(Math.random().toString() + Date.now()).toString();
    const tab: IDockTab = { id: tabId, ...anonTab };
    if (addNumber) {
      const tabNumber = this.getNewTabNumber(tab.kind);
      if (tabNumber > 1) tab.title += ` (${tabNumber})`
    }
    this.tabs.push(tab);
    this.selectTab(tab.id);
    this.open();
    return tab;
  }

  @action
  async closeTab(tabId: TabId) {
    const tab = this.getTabById(tabId);
    if (!tab || tab.pinned) {
      return;
    }
    this.tabs.remove(tab);
    if (this.selectedTabId === tab.id) {
      if (this.tabs.length) {
        const newTab = this.tabs.slice(-1)[0]; // last
        if (newTab.kind === TabKind.TERMINAL) {
          // close the dock when selected sibling inactive terminal tab
          const { terminalStore } = await import("./terminal.store");
          if (!terminalStore.isConnected(newTab.id)) this.close();
        }
        this.selectTab(newTab.id);
      }
      else {
        this.selectedTabId = null;
        this.close();
      }
    }
  }

  @action
  selectTab(tabId: TabId) {
    this.selectedTabId = this.getTabById(tabId)?.id ?? null;
  }

  @action
  setHeight(height?: number) {
    this.height = Math.max(this.minHeight, Math.min(height || this.minHeight, this.maxHeight));
  }

  @action
  reset() {
    this.selectedTabId = this.defaultTabId;
    this.tabs.replace(this.initialTabs);
    this.setHeight(this.defaultHeight);
    this.close();
  }
}

export const dockStore = new DockStore();
