/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OpenDialogOptions } from "electron";
import type { RequestChannel } from "@k8slens/messaging";

export type PathPickingResponse = {
  canceled: true;
} | {
  canceled: false;
  paths: string[];
};

export const openPathPickingDialogChannel: RequestChannel<OpenDialogOptions, PathPickingResponse> = {
  id: "open-path-picking-dialog",
};
