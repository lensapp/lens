/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import statInjectable from "./stat.injectable";
import { getGlobalOverride } from "../../test-utils/get-global-override";

export default getGlobalOverride(statInjectable, () => () => {
  throw new Error("Tried to call stat without explicit override");
});
