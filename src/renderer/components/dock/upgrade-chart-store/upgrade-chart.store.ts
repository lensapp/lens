/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  action,
  autorun,
  computed,
  IReactionDisposer,
  reaction,
  makeObservable,
} from "mobx";
import { DockStore, DockTab, TabId, TabKind } from "../dock-store/dock.store";
import { DockTabStorageState, DockTabStore } from "../dock-tab-store/dock-tab.store";
import {
  getReleaseValues,
  HelmRelease,
} from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { iter, StorageHelper } from "../../../utils";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

interface Dependencies {
  releases: IAsyncComputed<HelmRelease[]>
  valuesStore: DockTabStore<string>
  dockStore: DockStore
  createStorage: <T>(storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>
}

export class UpgradeChartStore extends DockTabStore<IChartUpgradeData> {
  private watchers = new Map<string, IReactionDisposer>();

  @computed private get releaseNameReverseLookup(): Map<string, string> {
    return new Map(iter.map(this.data, ([id, { releaseName }]) => [releaseName, id]));
  }

  get values() {
    return this.dependencies.valuesStore;
  }

  constructor(protected dependencies : Dependencies) {
    super(dependencies, {
      storageKey: "chart_releases",
    });

    makeObservable(this);

    autorun(() => {
      const { selectedTab, isOpen } = dependencies.dockStore;

      if (selectedTab?.kind === TabKind.UPGRADE_CHART && isOpen) {
        this.loadData(selectedTab.id);
      }
    }, { delay: 250 });

    autorun(() => {
      const objects = [...this.data.values()];

      objects.forEach(({ releaseName }) => this.createReleaseWatcher(releaseName));
    });
  }

  private createReleaseWatcher(releaseName: string) {
    if (this.watchers.get(releaseName)) {
      return;
    }
    const dispose = reaction(() => {
      const release = this.dependencies.releases.value.get().find(release => release.getName() === releaseName);

      return release?.getRevision(); // watch changes only by revision
    },
    release => {
      const releaseTab = this.getTabByRelease(releaseName);

      if (!releaseTab) {
        return;
      }

      // auto-reload values if was loaded before
      if (release) {
        if (this.dependencies.dockStore.selectedTab === releaseTab && this.values.getData(releaseTab.id)) {
          this.loadValues(releaseTab.id);
        }
      }
      // clean up watcher, close tab if release not exists / was removed
      else {
        dispose();
        this.watchers.delete(releaseName);
        this.dependencies.dockStore.closeTab(releaseTab.id);
      }
    });

    this.watchers.set(releaseName, dispose);
  }

  isLoading(tabId = this.dependencies.dockStore.selectedTabId) {
    const values = this.values.getData(tabId);

    return values === undefined;
  }

  @action
  async loadData(tabId: TabId) {
    const values = this.values.getData(tabId);

    await Promise.all([
      !values && this.loadValues(tabId),
    ]);
  }

  @action
  async loadValues(tabId: TabId) {
    this.values.clearData(tabId); // reset
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.setData(tabId, values);
  }

  getTabByRelease(releaseName: string): DockTab {
    return this.dependencies.dockStore.getTabById(this.releaseNameReverseLookup.get(releaseName));
  }
}
