/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { App } from "electron";
import type { PathName } from "../../../common/app-paths/app-path-names";

interface Dependencies {
  app: App;
}

export const getElectronAppPath =
  ({ app }: Dependencies) =>
    (name: PathName) : string | null => {
      try {
        return app.getPath(name);
      } catch (e) {
        return "";
      }
    };
