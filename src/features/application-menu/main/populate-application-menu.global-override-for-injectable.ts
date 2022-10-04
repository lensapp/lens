/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import populateApplicationMenuInjectable from "./populate-application-menu.injectable";
import { getGlobalOverride } from "../../../common/test-utils/get-global-override";

export default getGlobalOverride(populateApplicationMenuInjectable, () => () => {});
