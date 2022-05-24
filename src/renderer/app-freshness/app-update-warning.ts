/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed, makeObservable, observable } from "mobx";
import type { UpdateAvailableFromMain } from "../../common/ipc";
import { ipcRendererOn, UpdateAvailableChannel } from "../../common/ipc";
import { Singleton } from "../utils";
import moment from "moment";

interface Dependencies {
  releaseDate: string;
}

export class AppUpdateWarning extends Singleton {
  @observable updateReleaseDate = "";

  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);

    ipcRendererOn(UpdateAvailableChannel, (event, ...[, updateInfo]: UpdateAvailableFromMain) => {
      this.updateReleaseDate = updateInfo.releaseDate;
    });
  }

  @computed
  get warningLevel(): "high" | "medium" | "light" | "" {
    const update = moment(this.updateReleaseDate);
    const release = moment(this.dependencies.releaseDate);

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
