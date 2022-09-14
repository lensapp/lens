/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../test-utils/get-global-override";
import welcomeRouteConfig from "./welcome-route-config.injectable";

export default getGlobalOverride(welcomeRouteConfig, () => "/welcome");
