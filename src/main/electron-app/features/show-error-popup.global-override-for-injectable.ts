/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import showErrorPopupInjectable from "./show-error-popup.injectable";

export default getGlobalOverride(showErrorPopupInjectable, () => () => {
  throw new Error("Tried to show an error popup without an override");
});
