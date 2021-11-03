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

import * as uuid from "uuid";
import { action, computed, IReactionOptions, makeObservable, observable, reaction } from "mobx";
import { autoBind, createStorage } from "../../utils";
import throttle from "lodash/throttle";
import { monacoModelsManager } from "./monaco-model-manager";

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
  isOpen?: boolean;
}

export class DockStore implements DockStorageState {
  constructor() {
    makeObservable(this);
    autoBind(this);
    this.init();
  }

  readonly minHeight = 100;
  @observable fullSize = false;

  private storage = createStorage<DockStorageState>("dock", {
    height: 300,
    tabs: [
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
    ],
  });

  get whenReady() {
    return this.storage.whenReady;
  }

  get isOpen(): boolean {
    return this.storage.get().isOpen;
  }

  set isOpen(isOpen: boolean) {
    this.storage.merge({ isOpen });
  }

  get height(): number {
    return this.storage.get().height;
  }

  set height(height: number) {
    this.storage.merge({
      height: Math.max(this.minHeight, Math.min(height || this.minHeight, this.maxHeight)),
    });
  }

  get tabs(): DockTab[] {
    return this.storage.get().tabs;
  }

  set tabs(tabs: DockTab[]) {
    this.storage.merge({ tabs });
  }

  get selectedTabId(): TabId | undefined {
    return this.storage.get().selectedTabId
      || (
        this.tabs.length > 0
          ? this.tabs[0]?.id
          : undefined
      );
  }

  set selectedTabId(tabId: TabId) {
    if (tabId && !this.getTabById(tabId)) return; // skip invalid ids

    this.storage.merge({ selectedTabId: tabId });
  }

  @computed get selectedTab() {
    return this.tabs.find(tab => tab.id === this.selectedTabId);
  }

  private init() {
    // adjust terminal height if window size changes
    window.addEventListener("resize", throttle(this.adjustHeight, 250));
    // create monaco models
    this.whenReady.then(() => {this.tabs.forEach(tab => {
      if (this.usesMonacoEditor(tab)) {
        monacoModelsManager.addModel(tab.id);
      }
    });});
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

  onResize(callback: () => void, options?: IReactionOptions) {
    return reaction(() => [this.height, this.fullSize], callback, options);
  }

  onTabChange(callback: (tabId: TabId) => void, options?: IReactionOptions) {
    return reaction(() => this.selectedTabId, callback, options);
  }

  hasTabs() {
    return this.tabs.length > 0;
  }

  usesMonacoEditor(tab: DockTab): boolean {
    return [TabKind.CREATE_RESOURCE,
      TabKind.EDIT_RESOURCE,
      TabKind.INSTALL_CHART,
      TabKind.UPGRADE_CHART].includes(tab.kind);
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
        const tabNumber = +tab.title.match(/\d+/);

        return tabNumber === 0 ? 1 : tabNumber; // tab without a number is first
      });

    for (let i = 1; ; i++) {
      if (!tabNumbers.includes(i)) return i;
    }
  }

  @action
  createTab(rawTabDesc: DockTabCreate, addNumber = true): DockTab {
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

    // add monaco model
    if (this.usesMonacoEditor(tab)) {
      monacoModelsManager.addModel(id);
    }

    this.tabs.push(tab);
    this.selectTab(tab.id);
    this.open();

    return tab;
  }

  @action
  closeTab(tabId: TabId) {
    const tab = this.getTabById(tabId);

    if (!tab || tab.pinned) {
      return;
    }

    // remove monaco model
    if (this.usesMonacoEditor(tab)) {
      monacoModelsManager.removeModel(tabId);
    }

    this.tabs = this.tabs.filter(tab => tab.id !== tabId);

    if (this.selectedTabId === tab.id) {
      if (this.tabs.length) {
        const newTab = this.tabs.slice(-1)[0]; // last

        this.selectTab(newTab.id);
      } else {
        this.selectedTabId = null;
        this.close();
      }
    }
  }

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

    tab.title = title;
  }

  @action
  selectTab(tabId: TabId) {
    this.selectedTabId = this.getTabById(tabId)?.id ?? null;
  }

  @action
  reset() {
    this.storage?.reset();
  }
}

export const dockStore = new DockStore();
