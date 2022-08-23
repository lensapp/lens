/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { makeObservable } from "mobx";
import type { DockTabStoreDependencies } from "../dock-tab-store/dock-tab.store";
import { DockTabStore } from "../dock-tab-store/dock-tab.store";
import type { HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";

export interface IChartInstallData {
  name: string;
  repo: string;
  version: string;
  values?: string;
  releaseName?: string;
  description?: string;
  namespace?: string;
  lastVersion?: boolean;
}

export interface InstallChartTabStoreDependencies extends DockTabStoreDependencies {
  versionsStore: DockTabStore<string[]>;
  detailsStore: DockTabStore<HelmReleaseUpdateDetails>;
}

export class InstallChartTabStore extends DockTabStore<IChartInstallData> {
  constructor(protected readonly dependencies: InstallChartTabStoreDependencies) {
    super(dependencies, { storageKey: "install_charts" });
    makeObservable(this);
  }

  get versions() {
    return this.dependencies.versionsStore;
  }

  get details() {
    return this.dependencies.detailsStore;
  }
}
