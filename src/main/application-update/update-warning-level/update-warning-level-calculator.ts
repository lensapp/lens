/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
type WarningLevel = "high" | "medium" | "light" | "";

export class UpdateWarningLevelCalculator {
  private onceADay = 1000 * 60 * 60 * 24;
  private level: WarningLevel = "";

  constructor(private updateDownloadedDate: Date | null) {
  }

  get(): WarningLevel {
    const days = this.daysAfterUpdateAvailable;
  
    this.setHighWarningLevel(days);
    this.setMediumWarningLevel(days);
    this.setLightWarningLevel(days);

    return this.level;
  }

  private get daysAfterUpdateAvailable() {
    if (!this.updateDownloadedDate) {
      return 0;
    }
  
    const today = Date.now();
    const elapsedTime = today - this.updateDownloadedDate.getTime();
    const elapsedDays = elapsedTime / (this.onceADay);

    return elapsedDays;
  }

  private setHighWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 25) {
      this.level = "high";
    }
  }

  private setMediumWarningLevel(elapsedDays: number) {
    if (elapsedDays >= 20 && elapsedDays < 25) {
      this.level = "medium";
    }
  }

  private setLightWarningLevel(elapsedDays: number) {
    if (elapsedDays < 20) {
      this.level = "light";
    }
  }
}
