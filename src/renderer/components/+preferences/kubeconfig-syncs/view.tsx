/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Notice } from "../../+extensions/notice";
import type { KubeconfigSyncValue, UserStore } from "../../../../common/user-store";
import { iter, tuple } from "../../../utils";
import { SubTitle } from "../../layout/sub-title";
import { PathPicker } from "../../path-picker/path-picker";
import { Spinner } from "../../spinner";
import { RemovableItem } from "../removable-item";
import userStoreInjectable from "../../../../common/user-store/user-store.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import type { GetSyncEntry } from "./get-entry.injectable";
import type { GetAllSyncEntries } from "./get-all-entries.injectable";
import getAllSyncEntriesInjectable from "./get-all-entries.injectable";
import getSyncEntryInjectable from "./get-entry.injectable";

export interface SyncInfo {
  type: "file" | "folder" | "unknown";
}

interface SyncEntry extends SyncValue {
  filePath: string;
}

export interface SyncValue {
  data: KubeconfigSyncValue;
  info: SyncInfo;
}

interface Dependencies {
  userStore: UserStore;
  isWindows: boolean;
  getSyncEntry: GetSyncEntry;
  getAllSyncEntries: GetAllSyncEntries;
}

@observer
class NonInjectedKubeconfigSyncs extends React.Component<Dependencies> {
  syncs = observable.map<string, SyncValue>();
  @observable loaded = false;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const mapEntries = await Promise.all(
      iter.map(
        this.props.userStore.syncKubeconfigEntries,
        ([filePath, ...value]) => this.props.getSyncEntry({ filePath, ...value }),
      ),
    );

    this.syncs.replace(mapEntries);
    this.loaded = true;

    disposeOnUnmount(this, [
      reaction(
        () => Array.from(this.syncs.entries(), ([filePath, { data }]) => tuple.from(filePath, data)),
        syncs => {
          this.props.userStore.syncKubeconfigEntries.replace(syncs);
        },
      ),
    ]);
  }

  @computed get syncsList(): SyncEntry[] | undefined {
    if (!this.loaded) {
      return undefined;
    }

    return Array.from(this.syncs.entries(), ([filePath, value]) => ({ filePath, ...value }));
  }

  onPick = async (filePaths: string[]) => {
    this.syncs.merge(await this.props.getAllSyncEntries(filePaths));
  };

  getIconName(entry: SyncEntry) {
    switch (entry.info.type) {
      case "file":
        return "description";
      case "folder":
        return "folder";
      case "unknown":
        return "help_outline";
    }
  }

  renderEntry = (entry: SyncEntry) => {
    return (
      <RemovableItem
        key={entry.filePath}
        onRemove={() => this.syncs.delete(entry.filePath)}
        className="mt-3"
        icon={this.getIconName(entry)}
      >
        <div className="flex-grow break-all">
          {entry.filePath}
        </div>
      </RemovableItem>
    );
  };

  renderEntries() {
    const entries = this.syncsList;

    if (!entries) {
      return (
        <div className="loading-spinner">
          <Spinner />
        </div>
      );
    }

    if (!entries.length) {
      return (
        <Notice className="mt-3">
          <div className="flex-grow text-center">No files and folders have been synced yet</div>
        </Notice>
      );
    }

    return (
      <div>
        {entries.map(this.renderEntry)}
      </div>
    );
  }

  renderSyncButtons() {
    if (this.props.isWindows) {
      return (
        <div className="flex gaps align-center mb-5">
          <PathPicker
            label="Sync file(s)"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openFile"]}
          />
          <span>or</span>
          <PathPicker
            label="Sync folder(s)"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openDirectory"]}
          />
        </div>
      );
    }

    return (
      <div className="self-start mb-5">
        <PathPicker
          label="Sync Files and Folders"
          onPick={this.onPick}
          buttonLabel="Sync"
          properties={["showHiddenFiles", "multiSelections", "openFile", "openDirectory"]}
        />
      </div>
    );
  }

  render() {
    return (
      <>
        {this.renderSyncButtons()}
        <SubTitle title="Synced Items" className="pt-5"/>
        {this.renderEntries()}
      </>
    );
  }
}

export const KubeconfigSyncs = withInjectables<Dependencies>(NonInjectedKubeconfigSyncs, {
  getProps: (di) => ({
    userStore: di.inject(userStoreInjectable),
    isWindows: di.inject(isWindowsInjectable),
    getAllSyncEntries: di.inject(getAllSyncEntriesInjectable),
    getSyncEntry: di.inject(getSyncEntryInjectable),
  }),
});
