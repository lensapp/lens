/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { App } from "electron";
import type { PathName } from "@lensapp/app-paths";

interface Dependencies {
  app: App;
}

export type GetElectronAppPath = (name: PathName) => string;

export const getElectronAppPath = ({
  app,
}: Dependencies): GetElectronAppPath => (
  (name) => {
    try {
      return app.getPath(name);
    } catch (e) {
      return "";
    }
  }
);
