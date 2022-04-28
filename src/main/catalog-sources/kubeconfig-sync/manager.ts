/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, computed, makeObservable, observe } from "mobx";
import { catalogEntityRegistry } from "../../catalog";
import type { Disposer } from "../../../common/utils";
import { iter } from "../../../common/utils";
import { UserStore } from "../../../common/user-store";
import type { Logger } from "../../../common/logger";
import type { ChangesResult, WatchFileChanges } from "./watch-file-changes.injectable";

interface Dependencies {
  readonly directoryForKubeConfigs: string;
  readonly logger: Logger;
  watchFileChanges: WatchFileChanges;
}

const kubeConfigSyncName = "lens:kube-sync";

export class KubeconfigSyncManager {
  protected readonly sources = observable.map<string, ChangesResult>();
  protected syncing = false;
  protected syncListDisposer?: Disposer;

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);
  }

  @action
  startSync(): void {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    this.dependencies.logger.info(`starting requested syncs`);

    catalogEntityRegistry.addComputedSource(kubeConfigSyncName, computed(() => (
      Array.from(iter.flatMap(
        this.sources.values(),
        ({ source }) => source.get(),
      ))
    )));

    // This must be done so that c&p-ed clusters are visible
    this.startNewSync(this.dependencies.directoryForKubeConfigs);

    for (const filePath of UserStore.getInstance().syncKubeconfigEntries.keys()) {
      this.startNewSync(filePath);
    }

    this.syncListDisposer = observe(UserStore.getInstance().syncKubeconfigEntries, change => {
      switch (change.type) {
        case "add":
          this.startNewSync(change.name);
          break;
        case "delete":
          this.stopOldSync(change.name);
          break;
      }
    });
  }

  @action
  stopSync() {
    this.syncListDisposer?.();

    for (const filePath of this.sources.keys()) {
      this.stopOldSync(filePath);
    }

    catalogEntityRegistry.removeSource(kubeConfigSyncName);
    this.syncing = false;
  }

  @action
  protected startNewSync(filePath: string): void {
    if (this.sources.has(filePath)) {
      // don't start a new sync if we already have one
      return void this.dependencies.logger.debug(`already syncing file/folder`, { filePath });
    }

    this.sources.set(
      filePath,
      this.dependencies.watchFileChanges(filePath),
    );

    this.dependencies.logger.info(`starting sync of file/folder`, { filePath });
    this.dependencies.logger.debug(`${this.sources.size} files/folders watched`, { files: Array.from(this.sources.keys()) });
  }

  @action
  protected stopOldSync(filePath: string): void {
    if (!this.sources.delete(filePath)) {
      // already stopped
      return void this.dependencies.logger.debug(`no syncing file/folder to stop`, { filePath });
    }

    this.dependencies.logger.info(`stopping sync of file/folder`, { filePath });
    this.dependencies.logger.debug(`${this.sources.size} files/folders watched`, { files: Array.from(this.sources.keys()) });
  }
}
