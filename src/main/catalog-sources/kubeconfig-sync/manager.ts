/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { action, observable, IComputedValue, computed, ObservableMap, makeObservable, observe } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { Disposer, iter } from "../../../common/utils";
import type { KubeconfigSyncValue } from "../../../common/user-preferences";
import type { LensLogger } from "../../../common/logger";

export interface KubeconfigSyncManagerDependencies {
  addComputedEntitySource: (source: IComputedValue<CatalogEntity[]>) => Disposer;
  watchFileChanges: (filePath: string) => [IComputedValue<CatalogEntity[]>, Disposer];
  readonly directoryForKubeConfigs: string;
  readonly kubeconfigSyncEntries: ObservableMap<string, KubeconfigSyncValue>;
  readonly logger: LensLogger;
}

export class KubeconfigSyncManager {
  protected sources = observable.map<string, [IComputedValue<CatalogEntity[]>, Disposer]>();
  protected syncing = false;
  protected syncListDisposer?: Disposer;
  protected stopEntitySync?: Disposer;

  constructor(protected readonly dependencies: KubeconfigSyncManagerDependencies) {
    makeObservable(this);
  }

  @action
  startSync(): void {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    this.dependencies.logger.info(`starting requested syncs`);

    this.stopEntitySync = this.dependencies.addComputedEntitySource(computed(() => (
      Array.from(iter.flatMap(
        this.sources.values(),
        ([entities]) => entities.get(),
      ))
    )));

    // This must be done so that c&p-ed clusters are visible
    this.startNewSync(this.dependencies.directoryForKubeConfigs);

    for (const filePath of this.dependencies.kubeconfigSyncEntries.keys()) {
      this.startNewSync(filePath);
    }

    this.syncListDisposer = observe(this.dependencies.kubeconfigSyncEntries, change => {
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
    this.stopEntitySync?.();
    this.syncListDisposer?.();

    for (const filePath of this.sources.keys()) {
      this.stopOldSync(filePath);
    }

    this.syncing = false;
  }

  @action
  protected startNewSync(filePath: string): void {
    if (this.sources.has(filePath)) {
      // don't start a new sync if we already have one
      return void this.dependencies.logger.debug(`already syncing file/folder`, { filePath });
    }

    this.sources.set(filePath, this.dependencies.watchFileChanges(filePath));
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
