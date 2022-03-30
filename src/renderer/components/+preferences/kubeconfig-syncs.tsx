/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import fse from "fs-extra";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Notice } from "../+extensions/notice";
import type { KubeconfigSyncEntry, KubeconfigSyncValue, UserStore } from "../../../common/user-store";
import { iter, tuple } from "../../utils";
import { SubTitle } from "../layout/sub-title";
import { PathPicker } from "../path-picker/path-picker";
import { Spinner } from "../spinner";
import { RemovableItem } from "./removable-item";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { Logger } from "../../../common/logger";

interface SyncInfo {
  type: "file" | "folder" | "unknown";
}

interface Entry extends Value {
  filePath: string;
}

interface Value {
  data: KubeconfigSyncValue;
  info: SyncInfo;
}

async function getMapEntry({ filePath, ...data }: KubeconfigSyncEntry, logger: Logger): Promise<[string, Value]> {
  try {
    // stat follows the stat(2) linux syscall spec, namely it follows symlinks
    const stats = await fse.stat(filePath);

    if (stats.isFile()) {
      return [filePath, { info: { type: "file" }, data }];
    }

    if (stats.isDirectory()) {
      return [filePath, { info: { type: "folder" }, data }];
    }

    logger.warn("[KubeconfigSyncs]: unknown stat entry", { stats });

    return [filePath, { info: { type: "unknown" }, data }];
  } catch (error) {
    logger.warn(`[KubeconfigSyncs]: failed to stat entry: ${error}`, { error });

    return [filePath, { info: { type: "unknown" }, data }];
  }
}

export async function getAllEntries(filePaths: string[], logger: Logger): Promise<[string, Value][]> {
  return Promise.all(filePaths.map(filePath => getMapEntry({ filePath }, logger)));
}

interface Dependencies {
  userStore: UserStore;
  isWindows: boolean;
  logger: Logger;
}

@observer
class NonInjectedKubeconfigSyncs extends React.Component<Dependencies> {
  syncs = observable.map<string, Value>();
  @observable loaded = false;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const mapEntries = await Promise.all(
      iter.map(
        this.props.userStore.syncKubeconfigEntries,
        ([filePath, ...value]) => getMapEntry({ filePath, ...value }, this.props.logger),
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

  @computed get syncsList(): Entry[] | undefined {
    if (!this.loaded) {
      return undefined;
    }

    return Array.from(this.syncs.entries(), ([filePath, value]) => ({ filePath, ...value }));
  }

  onPick = async (filePaths: string[]) => {
    this.syncs.merge(await getAllEntries(filePaths, this.props.logger));
  };

  getIconName(entry: Entry) {
    switch (entry.info.type) {
      case "file":
        return "description";
      case "folder":
        return "folder";
      case "unknown":
        return "help_outline";
    }
  }

  renderEntry = (entry: Entry) => {
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

export const KubeconfigSyncs = withInjectables<Dependencies>(
  NonInjectedKubeconfigSyncs,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
      isWindows: di.inject(isWindowsInjectable),
      logger: di.inject(loggerInjectable),
    }),
  },
);
