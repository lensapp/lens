/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import populateApplicationMenuInjectable from "./populate-application-menu.injectable";
import { getGlobalOverride } from "@k8slens/test-utils";

export default getGlobalOverride(populateApplicationMenuInjectable, () => () => {});
