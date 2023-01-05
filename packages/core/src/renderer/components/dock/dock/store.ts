/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";
import { action, comparer, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import type { StorageLayer } from "../../../utils";
import { autoBind } from "../../../utils";
import throttle from "lodash/throttle";

export type TabId = string;

export enum TabKind {
  TERMINAL = "terminal",
  CREATE_RESOURCE = "create-resource",
  EDIT_RESOURCE = "edit-resource",
  INSTALL_CHART = "install-chart",
  UPGRADE_CHART = "upgrade-chart",
  POD_LOGS = "pod-logs",
}

/**
 * This is the storage model for dock tabs.
 *
 * All fields are required.
 */
export type DockTab = Required<DockTabCreate>;

/**
 * These are the arguments for creating a new Tab on the dock
 */
export interface DockTabCreate {
  /**
   * The ID of the tab for reference purposes.
   */
  id?: TabId;

  /**
   * What kind of dock tab it is
   */
  kind: TabKind;

  /**
   * The tab's title, defaults to `kind`
   */
  title?: string;

  /**
   * If true then the dock entry will take up the whole view and will not be
   * closable.
   */
  pinned?: boolean;

  /**
   * Extra fields are supported.
   */
  [key: string]: any;
}

/**
 * This type is for function which specifically create a single type of dock tab.
 *
 * That way users should get a type error if they try and specify a `kind`
 * themselves.
 */
export type DockTabCreateSpecific = Omit<DockTabCreate, "kind">;

export interface DockStorageState {
  height: number;
  tabs: DockTab[];
  selectedTabId?: TabId;
  isOpen: boolean;
}

export interface DockTabChangeEvent {
  tab: DockTab;
  tabId: TabId;
  prevTab?: DockTab;
}

export interface DockTabChangeEventOptions {
  /**
   * apply a callback right after initialization
   */
  fireImmediately?: boolean;
  /**
   * filter: by dockStore.selectedTab.kind == tabKind
   */
  tabKind?: TabKind;
  /**
   * filter: dock and selected tab should be visible (default: true)
   */
  dockIsVisible?: boolean;
}

export interface DockTabCloseEvent {
  tabId: TabId; // closed tab id
}

interface Dependencies {
  readonly storage: StorageLayer<DockStorageState>;
  readonly tabDataClearers: Record<TabKind, (tabId: TabId) => void>;
  readonly tabDataValidator: Partial<Record<TabKind, (tabId: TabId) => boolean>>;
}

export class DockStore implements DockStorageState {
  constructor(private readonly dependencies: Dependencies) {
    makeObservable(this);
    autoBind(this);
    this.init();
  }

  readonly minHeight = 100;
  @observable fullSize = false;

  get whenReady() {
    return this.dependencies.storage.whenReady;
  }

  @computed
  get isOpen(): boolean {
    return this.dependencies.storage.value.isOpen;
  }

  set isOpen(isOpen: boolean) {
    this.dependencies.storage.merge({ isOpen });
  }

  @computed
  get height(): number {
    return this.dependencies.storage.value.height;
  }

  set height(height: number) {
    this.dependencies.storage.merge({
      height: Math.max(this.minHeight, Math.min(height || this.minHeight, this.maxHeight)),
    });
  }

  @computed
  get tabs(): DockTab[] {
    return this.dependencies.storage.value.tabs;
  }

  set tabs(tabs: DockTab[]) {
    this.dependencies.storage.merge({ tabs });
  }

  @computed
  get selectedTabId(): TabId | undefined {
    const storageData = this.dependencies.storage.value;

    return (
      storageData.selectedTabId ||
      (this.tabs.length > 0 ? this.tabs[0]?.id : undefined)
    );
  }

  set selectedTabId(tabId: TabId | undefined) {
    if (tabId && !this.getTabById(tabId)) return; // skip invalid ids

    this.dependencies.storage.merge({ selectedTabId: tabId });
  }

  @computed get tabsNumber() : number {
    return this.tabs.length;
  }

  @computed get selectedTab() {
    return this.tabs.find(tab => tab.id === this.selectedTabId);
  }

  private init() {
    // adjust terminal height if window size changes
    window.addEventListener("resize", throttle(this.adjustHeight, 250));

    this.whenReady.then(action(() => {
      for (const tab of this.tabs) {
        const validator = this.dependencies.tabDataValidator[tab.kind];

        if (validator && !validator(tab.id)) {
          this.closeTab(tab.id);
        }
      }
    }));
  }

  get maxHeight() {
    const mainLayoutHeader = 40;
    const mainLayoutTabs = 33;
    const mainLayoutMargin = 16;
    const dockTabs = 33;
    const preferredMax = window.innerHeight - mainLayoutHeader - mainLayoutTabs - mainLayoutMargin - dockTabs;

    return Math.max(preferredMax, this.minHeight); // don't let max < min
  }

  protected adjustHeight() {
    if (this.height < this.minHeight) this.height = this.minHeight;
    if (this.height > this.maxHeight) this.height = this.maxHeight;
  }

  onResize(callback: () => void, opts: { fireImmediately?: boolean } = {}) {
    return reaction(() => [this.height, this.fullSize], callback, {
      fireImmediately: opts.fireImmediately,
    });
  }

  onTabClose(callback: (evt: DockTabCloseEvent) => void, opts: { fireImmediately?: boolean } = {}) {
    return reaction(() => this.tabs.map(tab => tab.id), (tabs: TabId[], prevTabs?: TabId[]) => {
      if (!Array.isArray(prevTabs)) {
        return; // tabs not yet modified
      }

      const closedTabs: TabId[] = prevTabs.filter(id => !tabs.includes(id));

      if (closedTabs.length > 0) {
        runInAction(() => {
          closedTabs.forEach(tabId => callback({ tabId }));
        });
      }
    }, {
      equals: comparer.structural,
      fireImmediately: opts.fireImmediately,
    });
  }

  onTabChange(callback: (evt: DockTabChangeEvent) => void, options: DockTabChangeEventOptions = {}) {
    const { tabKind, dockIsVisible = true, ...reactionOpts } = options;

    return reaction(() => this.selectedTab, ((tab, prevTab) => {
      if (!tab) return; // skip when dock is empty
      if (tabKind && tabKind !== tab.kind) return; // handle specific tab.kind only
      if (dockIsVisible && !this.isOpen) return;

      callback({
        tab, prevTab,
        tabId: tab.id,
      });
    }), reactionOpts);
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

  getTabIndex(tabId: TabId) {
    return this.tabs.findIndex(tab => tab.id === tabId);
  }

  protected getNewTabNumber(kind: TabKind) {
    const tabNumbers = this.tabs
      .filter(tab => tab.kind === kind)
      .map(tab => {
        const tabNumber = Number(tab.title.match(/\d+/));

        return tabNumber === 0 ? 1 : tabNumber; // tab without a number is first
      });

    for (let i = 1; ; i++) {
      if (!tabNumbers.includes(i)) return i;
    }
  }

  createTab = action((rawTabDesc: DockTabCreate, addNumber = true): DockTab => {
    const {
      id = uuid.v4(),
      kind,
      pinned = false,
      ...restOfTabFields
    } = rawTabDesc;
    let { title = kind } = rawTabDesc;

    if (addNumber) {
      const tabNumber = this.getNewTabNumber(kind);

      if (tabNumber > 1) {
        title += ` (${tabNumber})`;
      }
    }

    const tab: DockTab = {
      ...restOfTabFields,
      id,
      kind,
      pinned,
      title,
    };

    this.tabs.push(tab);
    this.selectTab(tab.id);
    this.open();

    return tab;
  });

  @action
  closeTab(tabId: TabId) {
    const tab = this.getTabById(tabId);
    const tabIndex = this.getTabIndex(tabId);

    if (!tab || tab.pinned) {
      return;
    }

    this.tabs = this.tabs.filter(tab => tab.id !== tabId);
    this.dependencies.tabDataClearers[tab.kind](tab.id);

    if (this.selectedTabId === tab.id) {
      if (this.tabs.length) {
        const newTab = tabIndex < this.tabsNumber ? this.tabs[tabIndex] : this.tabs[tabIndex - 1];

        this.selectTab(newTab.id);
      } else {
        this.selectedTabId = undefined;
        this.close();
      }
    }
  }

  @action
  closeTabs(tabs: DockTab[]) {
    tabs.forEach(tab => this.closeTab(tab.id));
  }

  closeAllTabs() {
    this.closeTabs([...this.tabs]);
  }

  closeOtherTabs(tabId: TabId) {
    const index = this.getTabIndex(tabId);
    const tabs = [...this.tabs.slice(0, index), ...this.tabs.slice(index + 1)];

    this.closeTabs(tabs);
  }

  closeTabsToTheRight(tabId: TabId) {
    const index = this.getTabIndex(tabId);
    const tabs = this.tabs.slice(index + 1);

    this.closeTabs(tabs);
  }

  renameTab(tabId: TabId, title: string) {
    const tab = this.getTabById(tabId);

    if (tab) {
      tab.title = title;
    }
  }

  @action
  selectTab(tabId: TabId) {
    this.selectedTabId = this.getTabById(tabId)?.id;
  }

  @action
  reset() {
    this.dependencies.storage?.reset();
  }
}
