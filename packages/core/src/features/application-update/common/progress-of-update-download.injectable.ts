/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { getSyncBoxInjectable } from "../../../common/utils/sync-box/sync-box-injection-token";

export interface ProgressOfDownload {
  percentage: number;
  failed?: string;
}

export type ProgressOfUpdateDownload = SyncBox<ProgressOfDownload>;

const progressOfUpdateDownloadInjectable = getSyncBoxInjectable<ProgressOfDownload>("progress-of-update-download", { percentage: 0 });

export default progressOfUpdateDownloadInjectable;
