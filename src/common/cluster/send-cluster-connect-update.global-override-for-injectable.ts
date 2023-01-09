/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import sendClusterConnectUpdateInjectable from "./send-cluster-connect-update.injectable";

export default getGlobalOverride(sendClusterConnectUpdateInjectable, () => () => {});
