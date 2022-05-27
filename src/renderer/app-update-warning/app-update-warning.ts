/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable, observable } from "mobx";
import { UpdateAvailableChannel } from "../../common/ipc";
import { Singleton } from "../utils";
import type { IpcRenderer } from "electron";

interface Dependencies {
  readonly ipcRenderer: IpcRenderer;
}

export class AppUpdateWarning extends Singleton {
  @observable warningLevel: "high" | "medium" | "light" | "" = "";
  @observable private updateAvailableDate: Date | null = this.getDateFromSessionStorage();
  private interval: NodeJS.Timeout | null = null;

  constructor(dependencies: Dependencies) {
    super();
    makeObservable(this);

    dependencies.ipcRenderer.on(UpdateAvailableChannel, () => {
      this.setUpdateAvailableDate();
      this.setWarningLevel();
      this.startRefreshLevelInterval();
    });
  }

  saveDateToSessionStorage() {
    if (this.updateAvailableDate) {
      window.sessionStorage.setItem("when-update-available", this.updateAvailableDate.toISOString());
    }
  }

  getDateFromSessionStorage() {
    const value = window.sessionStorage.getItem("when-update-available");

    if (!value) {
      return null;
    }

    const date = new Date(value);

    return isNaN(date.getTime()) ? null : date;
  }

  setUpdateAvailableDate() {
    if (!this.updateAvailableDate) {
      this.updateAvailableDate = new Date();
      this.saveDateToSessionStorage();
    }
  }

  private startRefreshLevelInterval() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.setWarningLevel();
      }, 1000 * 60); // Once a day
    }
  }

  private stopRefreshLevelInterval() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private get daysAfterUpdateAvailable() {
    if (!this.updateAvailableDate) {
      return 0;
    }

    const today = new Date();
    const elapsedTime = today.getTime() - this.updateAvailableDate.getTime();
    const elapsedDays = elapsedTime / (1000 * 60 * 60 * 24);

    return elapsedDays;
  }

  get minutesAfterUpdateAvailable() {
    if (!this.updateAvailableDate) {
      return 0;
    }

    const today = new Date();
    const elapsedTime = today.getTime() - this.updateAvailableDate.getTime();
    const elapsedMinutes = Math.floor(elapsedTime / (1000 * 60));

    return elapsedMinutes;
  }

  // private setHighWarningLevel(elapsedDays: number) {
  //   if (elapsedDays >= 25) {
  //     this.warningLevel = "high";
  //   }
  // }

  // private setMediumWarningLevel(elapsedDays: number) {
  //   if (elapsedDays >= 20 && elapsedDays < 25) {
  //     this.warningLevel = "medium";
  //   }
  // }

  // private setLightWarningLevel(elapsedDays: number) {
  //   if (elapsedDays < 20) {
  //     this.warningLevel = "light";
  //   }
  // }

  private setHighWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 6) {
      this.warningLevel = "high";
    }
  }

  private setMediumWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 2 && elapsedDays < 4) {
      this.warningLevel = "medium";
    }
  }

  private setLightWarningLevel(elapsedDays: number) {
    if (elapsedDays < 2) {
      this.warningLevel = "light";
    }
  }

  private setWarningLevel() {
    const days = this.minutesAfterUpdateAvailable;

    this.setHighWarningLevel(days);
    this.setMediumWarningLevel(days);
    this.setLightWarningLevel(days);
  }

  reset() {
    this.warningLevel = "";
    this.updateAvailableDate = null;
    this.stopRefreshLevelInterval();
  }
}
