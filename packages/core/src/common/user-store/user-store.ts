/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, makeObservable, isObservableArray, isObservableSet, isObservableMap, runInAction } from "mobx";
import type { BaseStore } from "../persistent-storage/base-store";
import { getOrInsertSet, toggle, object } from "@k8slens/utilities";
import type { UserPreferencesModel, StoreType } from "./preferences-helpers";
import type { EmitAppEvent } from "../app-event-bus/emit-event.injectable";

// TODO: Remove coupling with Feature
import type { SelectedUpdateChannel } from "../../features/application-update/common/selected-update-channel/selected-update-channel.injectable";
import type { ReleaseChannel } from "../../features/application-update/common/update-channels";
import type { PreferenceDescriptors } from "./preference-descriptors.injectable";
import type { CreatePersistentStorage } from "../persistent-storage/create.injectable";
import type { Logger } from "../logger";
import type { Migrations } from "conf/dist/source/types";
import { toJS } from "../utils";

export interface UserStoreModel {
  preferences: UserPreferencesModel;
}

interface Dependencies {
  readonly selectedUpdateChannel: SelectedUpdateChannel;
  readonly preferenceDescriptors: PreferenceDescriptors;
  readonly logger: Logger;
  readonly storeMigrationVersion: string;
  readonly migrations: Migrations<Record<string, unknown>>;
  emitAppEvent: EmitAppEvent;
  createPersistentStorage: CreatePersistentStorage;
}

export class UserStore {
  private readonly store: BaseStore<UserStoreModel>;

  constructor(protected readonly dependencies: Dependencies) {
    this.store = this.dependencies.createPersistentStorage({
      configName: "lens-user-store",
      projectVersion: this.dependencies.storeMigrationVersion,
      migrations: this.dependencies.migrations,
      fromStore: action(({ preferences }) => {
        this.dependencies.logger.debug("UserStore.fromStore()", { preferences });

        for (const [key, { fromStore }] of object.entries(this.dependencies.preferenceDescriptors)) {
          const curVal = this[key];
          const newVal = fromStore((preferences)?.[key] as never) as never;

          if (isObservableArray(curVal)) {
            curVal.replace(newVal);
          } else if (isObservableSet(curVal) || isObservableMap(curVal)) {
            curVal.replace(newVal);
          } else {
            this[key] = newVal;
          }
        }

        // TODO: Switch to action-based saving instead saving stores by reaction
        if (preferences?.updateChannel) {
          this.dependencies.selectedUpdateChannel.setValue(preferences?.updateChannel as ReleaseChannel);
        }
      }),
      toJSON: () => {
        const preferences = object.fromEntries(
          object.entries(this.dependencies.preferenceDescriptors)
            .map(([key, { toStore }]) => [key, toStore(this[key] as never)]),
        ) as UserPreferencesModel;

        return toJS({
          preferences: {
            ...preferences,
            updateChannel: this.dependencies.selectedUpdateChannel.value.get().id,
          },
        });
      },
    });

    makeObservable(this);
  }

  @observable allowErrorReporting!: StoreType<PreferenceDescriptors["allowErrorReporting"]>;
  @observable allowUntrustedCAs!: StoreType<PreferenceDescriptors["allowUntrustedCAs"]>;
  @observable colorTheme!: StoreType<PreferenceDescriptors["colorTheme"]>;
  @observable terminalTheme!: StoreType<PreferenceDescriptors["terminalTheme"]>;
  @observable localeTimezone!: StoreType<PreferenceDescriptors["localeTimezone"]>;
  @observable downloadMirror!: StoreType<PreferenceDescriptors["downloadMirror"]>;
  @observable httpsProxy!: StoreType<PreferenceDescriptors["httpsProxy"]>;
  @observable shell!: StoreType<PreferenceDescriptors["shell"]>;
  @observable downloadBinariesPath!: StoreType<PreferenceDescriptors["downloadBinariesPath"]>;
  @observable kubectlBinariesPath!: StoreType<PreferenceDescriptors["kubectlBinariesPath"]>;
  @observable terminalCopyOnSelect!: StoreType<PreferenceDescriptors["terminalCopyOnSelect"]>;
  @observable terminalConfig!: StoreType<PreferenceDescriptors["terminalConfig"]>;
  @observable extensionRegistryUrl!: StoreType<PreferenceDescriptors["extensionRegistryUrl"]>;

  /**
   * Download kubectl binaries matching cluster version
   */
  @observable downloadKubectlBinaries!: StoreType<PreferenceDescriptors["downloadKubectlBinaries"]>;

  /**
   * Whether the application should open itself at login.
   */
  @observable openAtLogin!: StoreType<PreferenceDescriptors["openAtLogin"]>;

  /**
   * The column IDs under each configurable table ID that have been configured
   * to not be shown
   */
  @observable hiddenTableColumns!: StoreType<PreferenceDescriptors["hiddenTableColumns"]>;

  /**
   * Monaco editor configs
   */
  @observable editorConfiguration!: StoreType<PreferenceDescriptors["editorConfiguration"]>;

  /**
   * The set of file/folder paths to be synced
   */
  @observable syncKubeconfigEntries!: StoreType<PreferenceDescriptors["syncKubeconfigEntries"]>;

  /**
   * Checks if a column (by ID) for a table (by ID) is configured to be hidden
   * @param tableId The ID of the table to be checked against
   * @param columnIds The list of IDs the check if one is hidden
   * @returns true if at least one column under the table is set to hidden
   */
  isTableColumnHidden(tableId: string, ...columnIds: (string | undefined)[]): boolean {
    if (columnIds.length === 0) {
      return false;
    }

    const config = this.hiddenTableColumns.get(tableId);

    if (!config) {
      return false;
    }

    return columnIds.some(columnId => columnId && config.has(columnId));
  }

  /**
   * Toggles the hidden configuration of a table's column
   */
  toggleTableColumnVisibility(tableId: string, columnId: string) {
    toggle(getOrInsertSet(this.hiddenTableColumns, tableId), columnId);
  }

  resetTheme() {
    runInAction(() => {
      this.colorTheme = this.dependencies.preferenceDescriptors.colorTheme.fromStore(undefined);
    });
  }

  load() {
    this.store.load();
  }
}
