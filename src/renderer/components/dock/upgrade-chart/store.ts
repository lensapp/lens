/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed } from "mobx";
import type { TabId } from "../dock/store";
import { DockTabStore } from "../dock-tab/store";

export interface IChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

export class UpgradeChartTabStore extends DockTabStore<IChartUpgradeData> {
  private releaseNameReverseLookup = computed(() => (
    new Map(this.getAllData().map(([id, { releaseName }]) => [releaseName, id]))
  ));

  getTabIdByRelease(releaseName: string): TabId {
    return this.releaseNameReverseLookup.get().get(releaseName);
  }
}
