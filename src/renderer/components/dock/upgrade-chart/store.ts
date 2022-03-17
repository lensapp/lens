/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, makeObservable } from "mobx";
import type { TabId } from "../dock/store";
import type { DockTabStorageState } from "../dock-tab-store/dock-tab.store";
import { DockTabStore } from "../dock-tab-store/dock-tab.store";
import { getReleaseValues } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import type { StorageHelper } from "../../../utils";
import assert from "assert";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

interface Dependencies {
  valuesStore: DockTabStore<string>;
  createStorage: <T>(storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>;
}

export class UpgradeChartTabStore extends DockTabStore<IChartUpgradeData> {
  @computed private get releaseNameReverseLookup(): Map<string, string> {
    return new Map(this.getAllData().map(([id, { releaseName }]) => [releaseName, id]));
  }

  get values() {
    return this.dependencies.valuesStore;
  }

  constructor(protected dependencies : Dependencies) {
    super(dependencies, {
      storageKey: "chart_releases",
    });

    makeObservable(this);
  }

  @action
  async reloadValues(tabId: TabId) {
    this.values.clearData(tabId); // reset
    const data =  this.getData(tabId);

    assert(data, "cannot reload values if no data");

    const { releaseName, releaseNamespace } = data;
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.setData(tabId, values);
  }

  getTabIdByRelease(releaseName: string) {
    return this.releaseNameReverseLookup.get(releaseName);
  }
}
