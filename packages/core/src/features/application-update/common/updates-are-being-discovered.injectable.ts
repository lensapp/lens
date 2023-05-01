/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { getSyncBoxInjectable } from "../../../common/utils/sync-box/sync-box-injection-token";

export type UpdatesAreBeingDiscovered = SyncBox<boolean>;

const updatesAreBeingDiscoveredInjectable = getSyncBoxInjectable("updates-are-being-discovered", false);

export default updatesAreBeingDiscoveredInjectable;
