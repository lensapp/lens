/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import { noop } from "../../utils";
import handleOnMainFrameCloseInjectable from "./on-main-frame-close.injectable";

export default getGlobalOverride(handleOnMainFrameCloseInjectable, () => noop);
