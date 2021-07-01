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

import React from "react";
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper } from "@material-ui/core";
import { Description, Folder, Delete, HelpOutline } from "@material-ui/icons";
import { action, computed, observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import fse from "fs-extra";
import { KubeconfigSyncEntry, KubeconfigSyncValue, UserStore } from "../../../common/user-store";
import { Spinner } from "../spinner";
import logger from "../../../main/logger";
import { iter } from "../../utils";
import { isWindows } from "../../../common/vars";
import { PathPicker } from "../path-picker";

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

async function getMapEntry({ filePath, ...data}: KubeconfigSyncEntry): Promise<[string, Value]> {
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

@observer
export class KubeconfigSyncs extends React.Component {
  syncs = observable.map<string, Value>();
  @observable loaded = false;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const mapEntries = await Promise.all(
      iter.map(
        UserStore.getInstance().syncKubeconfigEntries,
        ([filePath, ...value]) => getMapEntry({ filePath, ...value }),
      ),
    );

    this.syncs.replace(mapEntries);
    this.loaded = true;

    disposeOnUnmount(this, [
      reaction(() => Array.from(this.syncs.entries(), ([filePath, { data }]) => [filePath, data]), syncs => {
        UserStore.getInstance().syncKubeconfigEntries.replace(syncs);
      })
    ]);
  }

  @computed get syncsList(): Entry[] | undefined {
    if (!this.loaded) {
      return undefined;
    }

    return Array.from(this.syncs.entries(), ([filePath, value]) => ({ filePath, ...value }));
  }

  @action
  onPick = async (filePaths: string[]) => {
    const newEntries = await Promise.all(filePaths.map(filePath => getMapEntry({ filePath })));

    for (const [filePath, info] of newEntries) {
      this.syncs.set(filePath, info);
    }
  };

  renderEntryIcon(entry: Entry) {
    switch (entry.info.type) {
      case "file":
        return <Description />;
      case "folder":
        return <Folder />;
      case "unknown":
        return <HelpOutline />;
    }
  }

  renderEntry = (entry: Entry) => {
    return (
      <Paper className="entry" key={entry.filePath} elevation={3}>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              {this.renderEntryIcon(entry)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={entry.filePath}
            className="description"
          />
          <ListItemSecondaryAction className="action">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => this.syncs.delete(entry.filePath)}
            >
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Paper>
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

    return (
      <List className="kubeconfig-sync-list">
        {entries.map(this.renderEntry)}
      </List>
    );
  }

  renderSyncButtons() {
    if (isWindows) {
      return (
        <div className="flex gaps align-center">
          <PathPicker
            label="Sync file(s)"
            className="box grow"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openFile"]}
          />
          <PathPicker
            label="Sync folder(s)"
            className="box grow"
            onPick={this.onPick}
            buttonLabel="Sync"
            properties={["showHiddenFiles", "multiSelections", "openDirectory"]}
          />
        </div>
      );
    }

    return (
      <PathPicker
        label="Sync file(s) and folder(s)"
        onPick={this.onPick}
        buttonLabel="Sync"
        properties={["showHiddenFiles", "multiSelections", "openFile", "openDirectory"]}
      />
    );
  }

  render() {
    return (
      <>
        {this.renderSyncButtons()}
        {this.renderEntries()}
      </>
    );
  }
}
