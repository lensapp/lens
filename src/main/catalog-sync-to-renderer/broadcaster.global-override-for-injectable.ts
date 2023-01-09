/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { debounce } from "lodash";
import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import catalogSyncBroadcasterInjectable from "./broadcaster.injectable";

export default getGlobalOverride(catalogSyncBroadcasterInjectable, () => debounce(() => {}));
