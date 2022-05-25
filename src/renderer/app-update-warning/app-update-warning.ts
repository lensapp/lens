/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed, makeObservable, observable } from "mobx";
import type { UpdateAvailableFromMain } from "../../common/ipc";
import { UpdateAvailableChannel } from "../../common/ipc";
import { Singleton } from "../utils";
import moment from "moment";
import type { IpcRenderer } from "electron";

interface Dependencies {
  readonly releaseDate: string;
  readonly ipcRenderer: IpcRenderer;
}

export class AppUpdateWarning extends Singleton {
  @observable updateReleaseDate = "";

  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);

    dependencies.ipcRenderer.on(UpdateAvailableChannel, (event, ...[, updateInfo]: UpdateAvailableFromMain) => {
      this.downloadedUpdateDate = updateInfo?.releaseDate;
    });
  }

  set downloadedUpdateDate(date: string) {
    this.updateReleaseDate = date;
  }

  @computed
  get warningLevel(): "high" | "medium" | "light" | "" {
    const { updateReleaseDate, dependencies } = this;
    const { releaseDate } = dependencies;

    if (!updateReleaseDate || !releaseDate) {
      return "";
    }

    const update = moment(updateReleaseDate);
    const release = moment(releaseDate);

    const duration = moment.duration(update.diff(release));
    const days = duration.asDays();

    if (days >= 27) {
      return "high";
    }

    if (days >= 25 && days < 27) {
      return "medium";
    }

    if (days >= 20 && days < 25) {
      return "light";
    }

    return "";
  }
}
