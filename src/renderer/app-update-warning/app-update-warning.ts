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
  readonly sessionStorage: Storage;
}

const onceADay = 1000 * 60 * 60 * 24;

export class AppUpdateWarning extends Singleton {
  @observable warningLevel: "high" | "medium" | "light" | "" = "";
  @observable private updateAvailableDate: Date | null = this.getDateFromSessionStorage();
  private interval: NodeJS.Timeout | null = null;

  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);

    dependencies.ipcRenderer.on(UpdateAvailableChannel, () => {
      this.init();
    });
  }

  init() {
    this.setUpdateAvailableDate();
    this.saveDateToSessionStorage();
    this.setWarningLevel();
    this.startRefreshLevelInterval();
  }

  private saveDateToSessionStorage() {
    if (this.updateAvailableDate) {
      this.dependencies.sessionStorage.setItem("when-update-available", this.updateAvailableDate.toISOString());
    }
  }

  private getDateFromSessionStorage() {
    const value = this.dependencies.sessionStorage.getItem("when-update-available");

    if (!value) {
      return null;
    }
    
    const date = new Date(value);
    
    return isNaN(date.getTime()) ? null : date;
  }

  private setUpdateAvailableDate() {
    if (!this.updateAvailableDate) {
      this.updateAvailableDate = new Date();
      
    }
  }

  private startRefreshLevelInterval() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.setWarningLevel();
      }, onceADay);
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

    const today = Date.now();
    const elapsedTime = today - this.updateAvailableDate.getTime();
    const elapsedDays = elapsedTime / (onceADay);

    return elapsedDays;
  }

  private setHighWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 25) {
      this.warningLevel = "high";
    }
  }

  private setMediumWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 20 && elapsedDays < 25) {
      this.warningLevel = "medium";
    }
  }

  private setLightWarningLevel(elapsedDays: number) {
    if (elapsedDays < 20) {
      this.warningLevel = "light";
    }
  }

  private setWarningLevel() {
    const days = this.daysAfterUpdateAvailable;

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
