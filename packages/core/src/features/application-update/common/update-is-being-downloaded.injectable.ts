/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { getSyncBoxInjectable } from "../../../common/utils/sync-box/sync-box-injection-token";

export type UpdateIsBeingDownloaded = SyncBox<boolean>;

const updateIsBeingDownloadedInjectable = getSyncBoxInjectable("update-is-being-downloaded", false);

export default updateIsBeingDownloadedInjectable;
