/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getSyncBoxInjectable } from "../../../common/utils/sync-box/sync-box-injection-token";

const updateDownloadedDateTimeInjectable = getSyncBoxInjectable<string | null>("update-downloaded-date-time", null);

export default updateDownloadedDateTimeInjectable;
