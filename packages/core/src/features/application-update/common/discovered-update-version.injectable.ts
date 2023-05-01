/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { UpdateChannel } from "./update-channels";
import { getSyncBoxInjectable } from "../../../common/utils/sync-box/sync-box-injection-token";

export type DiscoveredUpdateVersion = { version: string; updateChannel: UpdateChannel } | null;

const discoveredUpdateVersionInjectable = getSyncBoxInjectable("discovered-update-version", null as DiscoveredUpdateVersion);

export default discoveredUpdateVersionInjectable;
