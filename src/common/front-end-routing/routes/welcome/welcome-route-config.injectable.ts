/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationInjectable from "../../../vars/application-information.injectable";

const welcomeRouteConfigInjectable = getInjectable({
  id: "welcome-route-config",

  instantiate: (di) => di.inject(applicationInformationInjectable).config.welcomeRoute,
});

export default welcomeRouteConfigInjectable;
