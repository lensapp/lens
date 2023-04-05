/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import EventEmitter from "events";
import autoUpdaterInjectable from "./auto-updater.injectable";

export default getGlobalOverride(autoUpdaterInjectable, () => {
  return new class extends EventEmitter implements Electron.AutoUpdater {
    checkForUpdates(): void {
      throw new Error("Method not implemented.");
    }
    getFeedURL(): string {
      throw new Error("Method not implemented.");
    }
    quitAndInstall(): void {
      throw new Error("Method not implemented.");
    }
    setFeedURL(options: Electron.FeedURLOptions): void {
      void options;
      throw new Error("Method not implemented.");
    }
  };
});
